import { AUTHOR, BASE_DIR, GA4_TAG, GTAG_ID, SITE_DESCRIPTION, SITE_TITLE } from "astro:env/client";

export { AUTHOR, BASE_DIR, GA4_TAG, GTAG_ID, SITE_DESCRIPTION, SITE_TITLE };

// ナビゲーションリンク
export const NAV_LINKS = [
	{ href: BASE_DIR, text: "Top" },
	{ href: `${BASE_DIR}works/`, text: "Works" },
	{ href: `${BASE_DIR}link/`, text: "Link" },
] as const;

export const CLASS_AUTO_IMG_ALT = "auto-img-alt";
