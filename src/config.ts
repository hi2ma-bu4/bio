import { AUTHOR, BASE_DIR, GA4_TAG, GTAG_ID, SITE_DESCRIPTION, SITE_TITLE } from "astro:env/client";

export { AUTHOR, BASE_DIR, GA4_TAG, GTAG_ID, SITE_DESCRIPTION, SITE_TITLE };

/**
 * ナビゲーションリンクの設定
 */
export const NAV_LINKS = [
	{ href: BASE_DIR, text: "Top" },
	{ href: `${BASE_DIR}works/`, text: "Works" },
	{ href: `${BASE_DIR}link/`, text: "Link" },
] as const;

/**
 * 自動生成された代替テキスト用のクラス名
 */
export const CLASS_AUTO_IMG_ALT = "auto-img-alt";

/**
 * 背景キャンバス（ミニ）のID
 */
export const ID_BACK_CANVAS_MINI = "back-canvas-mini";
