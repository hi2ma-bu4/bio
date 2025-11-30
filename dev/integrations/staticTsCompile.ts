import type { AstroIntegration } from "astro";
import esbuild from "esbuild";
import fg from "fast-glob";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { minify, type MinifyOptions } from "terser";

const manifest: Record<string, string> = {};

export default function compileAndMinifyTS({ srcDir, outDir = "dist/assets/static/", terserSetting }: { srcDir: string; outDir?: string; terserSetting?: MinifyOptions }): AstroIntegration {
	return {
		name: "compile-ts-and-terser",
		hooks: {
			"astro:build:generated": async (ctx) => {
				ctx.logger.info("TSコンパイル＆Terser圧縮開始…");

				// リセット
				Object.keys(manifest).forEach((k) => delete manifest[k]);

				await mkdir(outDir, { recursive: true });

				const files = await readdir(srcDir, { withFileTypes: true });
				const targets = files.filter((f) => f.isFile() && extname(f.name) === ".ts").map((f) => join(srcDir, f.name));

				const tasks: Promise<void>[] = [];

				for (const file of targets) {
					tasks.push(
						(async () => {
							// 1. esbuild でJSへ変換
							const build = await esbuild.build({
								entryPoints: [file],
								bundle: true,
								write: false,
								treeShaking: true,
								platform: "browser",
								format: "iife",
								target: "es2020",
								minify: false,
							});

							const jsCode = build.outputFiles![0].text;

							// 2. Terser で圧縮
							const minified = await minify(
								jsCode,
								terserSetting ?? {
									compress: true,
									mangle: true,
									ecma: 2020,
								}
							);

							if (!minified.code) {
								ctx.logger.warn(`⚠ 圧縮結果が空でした: ${file}`);
								return;
							}

							// 3. 圧縮後コードのハッシュ生成
							const hash = createHash("sha256").update(minified.code).digest("hex").slice(0, 10);

							// 4. 出力ファイル名へハッシュ付け
							const rel = relative(srcDir, file).replace(/\.ts$/, "");
							const name = `${rel}-${hash}.js`;
							const outPath = join(outDir, name);
							manifest[rel + ".js"] = name;
							await writeFile(outPath, minified.code, "utf8");

							ctx.logger.info(`✔ 出力: ${outPath}`);
						})()
					);
				}

				await Promise.all(tasks);
				ctx.logger.info("✨ TSコンパイル＆Terser圧縮完了！");
			},
			"astro:build:done": async ({ dir, logger }) => {
				// HTML を全部スキャンして置換
				const htmlFiles = await fg("dist/**/*.html");

				for (const htmlFile of htmlFiles) {
					let html = await readFile(htmlFile, "utf8");

					for (const [original, hashed] of Object.entries(manifest)) {
						html = html.replace(new RegExp(original, "g"), hashed);
					}

					await writeFile(htmlFile, html, "utf8");
					logger.info(`🔗 HTML 書き換え: ${htmlFile}`);
				}
			},
		},
	};
}
