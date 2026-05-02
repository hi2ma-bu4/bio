import type { AstroConfig, AstroIntegration } from "astro";
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

				if (!errorPage) {
					logger.warn("404 page not found in build output.");
					return;
				}

				let errorPagePath = path.join(outDir, "404.html");
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
					return path.join(outDir, relPath);
				};

				const escapeContent = (content: string, tag: "script" | "style") => {
					// HTML パーサーが終了タグと誤認するのを防ぐためにエスケープする
					// CSS や JS の中であればバックスラッシュによるエスケープが有効
					const regex = new RegExp(`</${tag}`, "gi");
					return content.replace(regex, (match) => `<\\/${match.slice(2)}`);
				};

				// CSSのインライン化
				html = await replaceAsync(html, /<link\s+[^>]*>/gi, async (fullMatch) => {
					if (!/rel=["']?stylesheet["']?/i.test(fullMatch)) return fullMatch;
					const hrefMatch = fullMatch.match(/href=["']?([^"'\s>]+)["']?/i);
					if (!hrefMatch) return fullMatch;

					const cssHref = hrefMatch[1];
					if (cssHref.startsWith("http") || cssHref.startsWith("//") || cssHref.startsWith("data:")) return fullMatch;

					const cssPath = resolveLocalPath(cssHref);
					try {
						let cssContent = await fs.readFile(cssPath, "utf-8");
						// CSS内のダブルクォートが url("data:...") で問題を起こすのを防ぐために
						// SVGデータURI内のダブルクォートをシングルクォートか%22に置換することを検討
						// ここでは安全のために全ての </style をエスケープする
						return `<style>${escapeContent(cssContent, "style")}</style>`;
					} catch (e) {
						logger.warn(`Failed to inline CSS: ${cssPath}`);
						return fullMatch;
					}
				});

				// JSのインライン化 (src属性)
				html = await replaceAsync(html, /<script\s+[^>]*src=["']?([^"'\s>]+)["']?[^>]*><\/script>/gi, async (fullMatch, jsSrc) => {
					if (jsSrc.startsWith("http") || jsSrc.startsWith("//") || jsSrc.includes("googletagmanager") || jsSrc.includes("~partytown") || jsSrc.startsWith("data:")) return fullMatch;

					const jsPath = resolveLocalPath(jsSrc);
					try {
						const jsContent = await fs.readFile(jsPath, "utf-8");
						return `<script type="module">${escapeContent(jsContent, "script")}</script>`;
					} catch (e) {
						logger.warn(`Failed to inline JS (src): ${jsPath}`);
						return fullMatch;
					}
				});

				// インラインスクリプト内の import を Data URI に変換
				html = await replaceAsync(html, /<script[^>]*>([\s\S]*?)<\/script>/gi, async (fullTag, content) => {
					if (!content.includes("import")) return fullTag;

					const importRegex = /import\s*([\s\S]*?from\s*)?["']([^"']+)["'];?/g;
					const updatedContent = await replaceAsync(content, importRegex, async (importMatch, importPart, importPath) => {
						if (importPath.startsWith("http") || importPath.startsWith("//") || importPath.startsWith("data:")) return importMatch;

						let resolvedJsPath = path.join(outDir, "assets/js", importPath.replace(/^\.\//, ""));

						try {
							await fs.access(resolvedJsPath);
						} catch {
							return importMatch;
						}

						try {
							const importedContent = await fs.readFile(resolvedJsPath, "utf-8");
							const base64 = Buffer.from(importedContent).toString("base64");
							const dataUri = `data:text/javascript;base64,${base64}`;
							return `import ${importPart || ""}"${dataUri}";`;
						} catch (e) {
							logger.warn(`Failed to convert import to data URI: ${resolvedJsPath}`);
							return importMatch;
						}
					});

					const tagStart = fullTag.slice(0, fullTag.indexOf(">") + 1);
					return `${tagStart}${updatedContent}</script>`;
				});

				// dist/404.html として保存
				const final404Path = path.join(outDir, "404.html");
				await fs.writeFile(final404Path, html, "utf-8");
				logger.info(`Inlined 404 page created at ${final404Path}`);

				if (errorPageDir) {
					await fs.rm(errorPageDir, { recursive: true, force: true });
					logger.info(`Cleaned up ${errorPageDir}`);
				}
			},
		},
	};
}

async function replaceAsync(str: string, regex: RegExp, asyncFn: (...args: any[]) => Promise<string>) {
	const parts: (string | Promise<string>)[] = [];
	let lastIndex = 0;
	let match;

	// RegExp の状態をリセットするために global フラグを確認
	const isGlobal = regex.global;
	const localRegex = isGlobal ? regex : new RegExp(regex.source, regex.flags + "g");

	while ((match = localRegex.exec(str)) !== null) {
		parts.push(str.slice(lastIndex, match.index));
		parts.push(asyncFn(...match, match.index, str));
		lastIndex = localRegex.lastIndex;
		if (!isGlobal) break;
	}
	parts.push(str.slice(lastIndex));

	const resolvedParts = await Promise.all(parts);
	return resolvedParts.join("");
}
