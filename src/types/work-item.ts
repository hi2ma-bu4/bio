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

export interface WorkItemData extends Work {
	longDescription: string;
	otherUrls?: string[];
}

export function isImageMetadata(v: Src): v is ImageMetadata {
	return typeof v === "object" && v !== null && "src" in v;
}

const imageWidthsBase = [240, 540, 720, 960, 1536, 2560] as const;

export function getImageWidths(image: ImageMetadata): number[] {
	const width = image.width;
	if (!width) return imageWidthsBase.slice();
	const widths: number[] = imageWidthsBase.filter((w) => w <= width);
	widths.push(width);
	return widths;
}
