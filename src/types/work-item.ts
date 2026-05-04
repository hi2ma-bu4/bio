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
