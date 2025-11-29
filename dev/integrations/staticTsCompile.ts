import type { AstroIntegration } from "astro";
import esbuild from "esbuild";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { minify, type MinifyOptions } from "terser";

export default function compileAndMinifyTS({ srcDir, outDir = "dist/assets/static/", terserSetting }: { srcDir: string; outDir?: string; terserSetting?: MinifyOptions }): AstroIntegration {
	return {
		name: "compile-ts-and-terser",
		hooks: {
			"astro:build:generated": async (ctx) => {
				ctx.logger.info("TSコンパイル＆Terser圧縮開始…");

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

							// 3. 出力
							const rel = relative(srcDir, file); // ← これで絶対安全
							const outPath = join(outDir, rel.replace(/\.ts$/, ".js"));
							await writeFile(outPath, minified.code, "utf8");

							ctx.logger.info(`✔ 出力: ${outPath}`);
						})()
					);
				}

				await Promise.all(tasks);
				ctx.logger.info("✨ TSコンパイル＆Terser圧縮完了！");
			},
		},
	};
}
