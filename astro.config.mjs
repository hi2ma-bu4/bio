import "dotenv/config";

import { defineConfig, envField } from "astro/config";

import sitemap from "@astrojs/sitemap";
import solidJs from "@astrojs/solid-js";
import tailwindVite from "@tailwindcss/vite";
import htmlMinifierNext from "astro-html-minifier-next";
import relativeLinks from "astro-relative-links";

export default defineConfig({
	output: "static",
	site: process.env.SITE_URL,
	base: process.env.BASE_DIR,
	trailingSlash: "always",
	build: {
		format: "directory",
	},
	prefetch: {
		prefetchAll: true,
	},
	integrations: [
		solidJs(),
		sitemap(),
		relativeLinks(),
		htmlMinifierNext({
			collapseInlineTagWhitespace: true,
			keepClosingSlash: true,
			minifyCSS: true,
			minifyJS: true,
		}),
	],
	vite: {
		plugins: [tailwindVite()],
	},
	env: {
		schema: {
			BASE_DIR: envField.string({
				context: "client",
				access: "public",
			}),
		},
	},
});
