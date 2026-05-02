import type { AstroConfig, AstroIntegration } from "astro";
import esbuild from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default function inline404Integration(): AstroIntegration {
	let config: AstroConfig;
	return {
		name: "inline-404",
		hooks: {
			"astro:config:done": ({ config: _config }) => {
				config = _config;
			},
			"astro:build:done": async ({ dir, pages, logger }) => {
				const outDir = fileURLToPath(dir);
				const errorPage = pages.find((p) => p.pathname === "404/" || p.pathname === "404.html");
				if (!errorPage) return;

				const final404Path = path.join(outDir, "404.html");
				let errorPagePath = final404Path;
				let errorPageDir = "";
				try {
					await fs.access(errorPagePath);
				} catch {
					errorPageDir = path.join(outDir, "404");
					errorPagePath = path.join(errorPageDir, "index.html");
					try {
						await fs.access(errorPagePath);
					} catch {
						logger.error(`404 page not found in ${outDir}`);
						return;
					}
				}

				let html = await fs.readFile(errorPagePath, "utf-8");

				const resolveLocalPath = (href: string) => {
					const base = config.base.endsWith("/") ? config.base : config.base + "/";
					let relPath = href;
					if (relPath.startsWith(base)) {
						relPath = relPath.slice(base.length);
					} else if (relPath.startsWith("/")) {
						relPath = relPath.slice(1);
					}
					relPath = relPath.replace(/^(\.\.\/)+/, "");
					return path.join(outDir, relPath);
				};

				const escapeTags = (content: string, isScript: boolean) => {
					if (isScript) {
						return content.replace(/<\/script/gi, "<\\/script").replace(/<script/gi, "<\\script");
					} else {
						return content.replace(/<\/style/gi, "\\3c /style").replace(/<style/gi, "\\3c style");
					}
				};

				const tags: any[] = [];
				let pos = 0;
				// Scripts
				while ((pos = html.indexOf("<script", pos)) !== -1) {
					const endOpen = html.indexOf(">", pos);
					if (endOpen === -1) break;
					const attrPart = html.slice(pos + 7, endOpen);
					const closePos = html.indexOf("</script>", endOpen);
					if (closePos === -1) break;
					const content = html.slice(endOpen + 1, closePos);
					tags.push({ type: "script", start: pos, end: closePos + 9, full: html.slice(pos, closePos + 9), attrs: attrPart, content });
					pos = closePos + 9;
				}
				// Links
				pos = 0;
				while ((pos = html.indexOf("<link", pos)) !== -1) {
					const endOpen = html.indexOf(">", pos);
					if (endOpen === -1) break;
					const full = html.slice(pos, endOpen + 1);
					if (full.includes('rel="stylesheet"') || full.includes("rel='stylesheet'")) {
						tags.push({ type: "link", start: pos, end: endOpen + 1, full, attrs: full.slice(5, -1) });
					}
					pos = endOpen + 1;
				}
				tags.sort((a, b) => a.start - b.start);

				const filteredTags = [];
				let lastEnd = 0;
				for (const t of tags) {
					if (t.start >= lastEnd) {
						filteredTags.push(t);
						lastEnd = t.end;
					}
				}

				const replacements = await Promise.all(
					filteredTags.map(async (tag) => {
						if (tag.type === "link") {
							const hrefMatch = tag.attrs.match(/href=["']?([^"'\s>]+)["']?/i);
							if (!hrefMatch) return { content: tag.full, moveToBottom: false };
							const href = hrefMatch[1];
							if (href.startsWith("http") || href.startsWith("//") || href.startsWith("data:")) return { content: tag.full, moveToBottom: false };
							try {
								const result = await esbuild.build({
									entryPoints: [resolveLocalPath(href)],
									bundle: true,
									minify: true,
									write: false,
									absWorkingDir: outDir,
									loader: { ".woff": "dataurl", ".woff2": "dataurl", ".ttf": "dataurl", ".svg": "dataurl", ".png": "dataurl", ".jpg": "dataurl" },
								});
								return { content: `<style>${escapeTags(result.outputFiles[0].text, false)}</style>`, moveToBottom: false };
							} catch {
								return { content: tag.full, moveToBottom: false };
							}
						} else {
							if (tag.attrs.includes("text/partytown") || tag.full.includes("googletagmanager")) return { content: tag.full, moveToBottom: false };
							const srcMatch = tag.attrs.match(/src=["']?([^"'\s>]+)["']?/i);
							const isModule = /type=["']?module["']?/i.test(tag.attrs);

							if (srcMatch) {
								const src = srcMatch[1];
								if (src.startsWith("http") || src.startsWith("//") || src.startsWith("data:")) return { content: tag.full, moveToBottom: false };
								try {
									const result = await esbuild.build({
										entryPoints: [resolveLocalPath(src)],
										bundle: true,
										minify: true,
										format: "iife",
										write: false,
										platform: "browser",
										target: "es2020",
										absWorkingDir: outDir,
										define: { "process.env.NODE_ENV": '"production"' },
									});
									return { content: `<script>${escapeTags(result.outputFiles[0].text, true)}</script>`, moveToBottom: true };
								} catch {
									return { content: tag.full, moveToBottom: false };
								}
							} else if (tag.content.includes("import")) {
								try {
									const tempFile = path.join(outDir, `temp-inline-${Math.random().toString(36).slice(2)}.js`);
									const adjusted = tag.content.replace(/(\.\.\/)+assets\//g, "./assets/");
									await fs.writeFile(tempFile, adjusted, "utf-8");
									const result = await esbuild.build({
										entryPoints: [tempFile],
										bundle: true,
										minify: true,
										format: "iife",
										write: false,
										platform: "browser",
										target: "es2020",
										absWorkingDir: outDir,
									});
									await fs.unlink(tempFile);
									return { content: `<script>${escapeTags(result.outputFiles[0].text, true)}</script>`, moveToBottom: true };
								} catch {
									return { content: tag.full, moveToBottom: false };
								}
							} else {
								// Regular inline script - move to bottom but escape
								return { content: `<script${tag.attrs}>${escapeTags(tag.content, true)}</script>`, moveToBottom: true };
							}
						}
					}),
				);

				let finalHtml = "";
				let cursor = 0;
				const bottomContent = [];
				for (let i = 0; i < filteredTags.length; i++) {
					finalHtml += html.slice(cursor, filteredTags[i].start);
					if (replacements[i].moveToBottom) {
						bottomContent.push(replacements[i].content);
					} else {
						finalHtml += replacements[i].content;
					}
					cursor = filteredTags[i].end;
				}
				finalHtml += html.slice(cursor);

				if (bottomContent.length > 0) {
					const block = bottomContent.join("\n");
					const bodyEnd = finalHtml.lastIndexOf("</body>");
					if (bodyEnd !== -1) {
						finalHtml = finalHtml.slice(0, bodyEnd) + block + finalHtml.slice(bodyEnd);
					} else {
						finalHtml += block;
					}
				}

				finalHtml = finalHtml.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (match, attrs, content) => {
					if ((content.includes("<style") || content.includes("</style")) && !content.includes("\\3c")) {
						return `<style${attrs}>${escapeTags(content, false)}</style>`;
					}
					return match;
				});

				await fs.writeFile(final404Path, finalHtml, "utf-8");
				logger.info(`Inlined 404 page created at ${final404Path}`);
				if (errorPageDir) await fs.rm(errorPageDir, { recursive: true, force: true });
			},
		},
	};
}
