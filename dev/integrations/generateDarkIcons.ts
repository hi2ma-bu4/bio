import type { AstroIntegration } from "astro";
import { copyFile, mkdir } from "node:fs/promises";
import { extname, join } from "node:path";
import sharp from "sharp";

export default function generateDarkIcons({ darkSrc, outDir = "dist/" }: { darkSrc: string; outDir: string }): AstroIntegration {
	return {
		name: "generate-dark-icons",
		hooks: {
			"astro:build:generated": async (ctx) => {
				ctx.logger.info("Darkアイコン自動生成開始…");

				// 出力ディレクトリ作成
				await mkdir(outDir, { recursive: true });

				// 全てのファイル生成タスク（Promise）を格納する配列
				const tasks: Promise<void>[] = [];

				/**
				 * バリアントごとの生成処理を登録する関数
				 * @param src ソースファイルのパス
				 * @param prefix ファイル名のプレフィックス
				 */
				const scheduleVariant = (src: string, prefix: string) => {
					const ext = extname(src);

					// 1. Favicon (SVG等はそのままコピー)
					const faviconName = `favicon-${prefix}${ext}`;
					const faviconOutput = join(outDir, faviconName);

					tasks.push(copyFile(src, faviconOutput).then(() => ctx.logger.info(`✔ ${faviconName}`)));

					// 2. favicon.ico 生成 (48x48リサイズ)
					const icoOutput = join(outDir, `favicon-${prefix}.ico`);
					tasks.push(
						sharp(src)
							.resize(48, 48)
							.toFile(icoOutput)
							.then(() => ctx.logger.info(`✔ favicon-${prefix}.ico`))
					);
				};

				// タスクのスケジュール登録
				scheduleVariant(darkSrc, "dark");

				// 全タスクを並列実行して完了を待つ
				await Promise.all(tasks);

				ctx.logger.info("✨ Darkアイコン自動生成完了！");
			},
		},
	};
}
