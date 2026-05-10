export type Src = string | ImageMetadata | null;

export interface Work {
	id: string; // モーダル起動用ID
	title: string;
	description: string;
	imageUrl: Src;
	tags: string[];
	directLink?: string; // 直接移動用リンク
	githubLink?: string; // GitHubリポジトリ
}

type ldJsonWorkType = "SoftwareSourceCode" | "WebApplication" | "VideoGame" | "CollectionPage";

export interface WorkItemData extends Work {
	longDescription: string;
	otherUrls?: string[];
	license?: string;
	ldJsonType?: ldJsonWorkType | ldJsonWorkType[];
}

/**
 * 値が ImageMetadata かどうかを判定する
 * @param v - 判定する値
 * @returns ImageMetadata であれば true
 */
export function isImageMetadata(v: Src): v is ImageMetadata {
	return typeof v === "object" && v !== null && "src" in v;
}

const imageWidthsBase = [240, 540, 720, 960, 1536, 2560] as const;

/**
 * 画像のメタデータから生成すべき画像幅のリストを取得する
 * @param image - 画像のメタデータ
 * @returns 画像幅の配列
 */
export function getImageWidths(image: ImageMetadata): number[] {
	const width = image.width;
	if (!width) return imageWidthsBase.slice();
	const widths: number[] = imageWidthsBase.filter((w) => w <= width);
	widths.push(width);
	return widths;
}
