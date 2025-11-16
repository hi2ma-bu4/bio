import { BASE_DIR, SITE_DESCRIPTION, SITE_TITLE } from "astro:env/client";

export { BASE_DIR, SITE_DESCRIPTION, SITE_TITLE };

// ナビゲーションリンク
export const NAV_LINKS = [
	{ href: BASE_DIR, text: "Top" },
	{ href: `${BASE_DIR}works/`, text: "Works" },
	{ href: `${BASE_DIR}link/`, text: "Link" },
] as const;
