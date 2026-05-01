import type { AstroIntegration } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default function inline404Integration(): AstroIntegration {
	return {
		name: "inline-404",
		hooks: {
			"astro:build:done": async ({ dir, pages }) => {
				const outDir = fileURLToPath(dir);
				const errorPage = pages.find((p) => p.pathname === "404/" || p.pathname === "404.html");

				if (!errorPage) {
					console.warn("404 page not found in build output.");
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
						console.error(`404 page not found in ${outDir}`);
						return;
					}
				}

				let html = await fs.readFile(errorPagePath, "utf-8");

				// CSSのインライン化
				const cssRegex = /<link [^>]*rel="stylesheet" [^>]*href="([^"]+)"[^>]*>/g;
				html = await replaceAsync(html, cssRegex, async (fullMatch, cssHref) => {
					if (cssHref.startsWith("http") || cssHref.startsWith("//")) return fullMatch;
					const cssRelativePath = cssHref.startsWith("/") ? cssHref.slice(1) : cssHref;
					const cssPath = path.join(outDir, cssRelativePath.replace(/^bio\//, ""));
					try {
						const cssContent = await fs.readFile(cssPath, "utf-8");
						return `<style>${cssContent}</style>`;
					} catch (e) {
						console.warn(`Failed to inline CSS: ${cssPath}`, e);
						return fullMatch;
					}
				});

				// JSのインライン化
				const jsSrcRegex = /<script [^>]*src="([^"]+)"[^>]*><\/script>/g;
				html = await replaceAsync(html, jsSrcRegex, async (fullMatch, jsSrc) => {
					if (jsSrc.startsWith("http") || jsSrc.startsWith("//") || jsSrc.includes("googletagmanager") || jsSrc.includes("~partytown")) return fullMatch;
					const jsRelativePath = jsSrc.startsWith("/") ? jsSrc.slice(1) : jsSrc;
					const jsPath = path.join(outDir, jsRelativePath.replace(/^bio\//, ""));
					try {
						const jsContent = await fs.readFile(jsPath, "utf-8");
						return `<script type="module">${jsContent}</script>`;
					} catch (e) {
						console.warn(`Failed to inline JS (src): ${jsPath}`, e);
						return fullMatch;
					}
				});

				// スクリプト内の import を Data URI に変換
				const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
				html = await replaceAsync(html, scriptRegex, async (fullTag, content) => {
					// GAなどのインラインスクリプトは無視したいが、インポートが含まれるものだけ処理する
					if (!content.includes("import")) return fullTag;

					const importRegex = /import\s*([\s\S]*?from\s*)?["']([^"']+)["'];?/g;
					const updatedContent = await replaceAsync(content, importRegex, async (importMatch, importPart, importPath) => {
						if (importPath.startsWith("http") || importPath.startsWith("//") || importPath.startsWith("data:")) return importMatch;

						// パス解決。インライン化されたスクリプト内の相対パスは通常 assets/js/ からの相対
						let resolvedJsPath = path.join(outDir, "assets/js", importPath.replace(/^\.\//, ""));

						try {
							await fs.access(resolvedJsPath);
						} catch {
							// 解決できない場合は元のまま
							return importMatch;
						}

						try {
							const importedContent = await fs.readFile(resolvedJsPath, "utf-8");
							const base64 = Buffer.from(importedContent).toString("base64");
							const dataUri = `data:text/javascript;base64,${base64}`;
							return `import ${importPart || ""}"${dataUri}";`;
						} catch (e) {
							console.warn(`Failed to convert import to data URI: ${resolvedJsPath}`, e);
							return importMatch;
						}
					});

					return fullTag.replace(content, updatedContent);
				});

				// dist/404.html として保存
				const final404Path = path.join(outDir, "404.html");
				await fs.writeFile(final404Path, html, "utf-8");
				console.log(`Inlined 404 page created at ${final404Path}`);

				if (errorPageDir) {
					await fs.rm(errorPageDir, { recursive: true, force: true });
					console.log(`Cleaned up ${errorPageDir}`);
				}
			},
		},
	};
}

async function replaceAsync(str: string, regex: RegExp, asyncFn: (...args: any[]) => Promise<string>) {
	const promises: Promise<string>[] = [];
	str.replace(regex, (...args) => {
		promises.push(asyncFn(...args));
		return "";
	});
	const data = await Promise.all(promises);
	return str.replace(regex, () => data.shift()!);
}
