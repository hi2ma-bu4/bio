export interface WorkItemData {
	id: string;
	title: string;
	description: string;
	imageUrl: string;
	tags: string[];
	directLink?: string;
	githubLink?: string;
	longDescription: string;
	othUrls?: string[];
}
