import { BASE_DIR } from "astro:env/client";

export { BASE_DIR };

// サイトの共通設定
export const SITE_TITLE = "snowsSite";
export const SITE_DESCRIPTION = "snows(hi2ma-bu4)のホームページです。";

// ナビゲーションリンク
export const NAV_LINKS = [
	{ href: BASE_DIR, text: "Top" },
	{ href: `${BASE_DIR}works/`, text: "Works" },
	{ href: `${BASE_DIR}link/`, text: "Link" },
] as const;
