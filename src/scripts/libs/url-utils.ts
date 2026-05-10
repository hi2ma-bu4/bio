import { SITE_URL } from "../../config";

/**
 * 末端スラッシュの付与を行うURL生成関数
 * ※クエリパラメータとハッシュタグが削除されます
 * @param pathname - 生成するURLのパス名
 * @return 生成されたURL
 */
export function createUrl(pathname: string): string {
	const url = new URL(pathname, SITE_URL);

	// ファイルっぽいパスは除外
	const isFile = /\.[a-z0-9]+$/i.test(url.pathname);

	if (!isFile && !url.pathname.endsWith("/")) {
		url.pathname += "/";
	}

	return url.toString();
}
