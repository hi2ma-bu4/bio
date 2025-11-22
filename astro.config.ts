import "dotenv/config";

import { defineConfig, envField } from "astro/config";

import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import solidJs from "@astrojs/solid-js";
import tailwindVite from "@tailwindcss/vite";
import { minimal2023Preset as preset } from "@vite-pwa/assets-generator/config";
import AstroPWA from "@vite-pwa/astro";
import htmlMinifierNext from "astro-html-minifier-next";

const BASE_DIR = process.env.BASE_DIR ?? "/";
const SITE_TITLE = process.env.SITE_TITLE ?? "snowsSite";

const envFieldSetting = {
	context: "client",
	access: "public",
} as const;

export default defineConfig({
	output: "static",
	site: process.env.SITE_URL,
	base: BASE_DIR,
	trailingSlash: "always",
	build: {
		format: "directory",
	},
	cacheDir: "./.cache/astro/",
	prefetch: {
		prefetchAll: true,
		defaultStrategy: "hover",
	},
	integrations: [
		solidJs(),
		AstroPWA({
			mode: "production",
			registerType: "autoUpdate",
			devOptions: {
				enabled: true,
			},
			pwaAssets: {
				preset,
				image: "public/favicon.svg",
			},
			manifest: {
				name: SITE_TITLE,
				short_name: SITE_TITLE,
				description: process.env.SITE_DESCRIPTION,
				theme_color: "#1D396F",
				display: "standalone",
				start_url: BASE_DIR,
				scope: BASE_DIR,
				icons: [
					{
						src: `${BASE_DIR}favicon.svg`,
						sizes: "200x200",
						type: "image/svg+xml",
					},
					{
						src: `${BASE_DIR}pwa-64x64.png`,
						sizes: "64x64",
						type: "image/png",
					},
					{
						src: `${BASE_DIR}pwa-192x192.png`,
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: `${BASE_DIR}pwa-512x512.png`,
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: `${BASE_DIR}maskable-icon-512x512.png`,
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{ico,css,js,png,jpg,webp,svg,ttf,svg,woff,woff2}"],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: "StaleWhileRevalidate",
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: "StaleWhileRevalidate",
					},
					{
						urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
						handler: "StaleWhileRevalidate",
					},
				],
			},
		}),
		partytown({
			config: {
				forward: [
					// GoogleTagManager
					"dataLayer.push",
					"gtag",
				],
			},
		}),
		sitemap({
			changefreq: "weekly",
			priority: 0.8,
			lastmod: new Date(),
		}),
		htmlMinifierNext({
			html5: true,
			collapseInlineTagWhitespace: true,
			collapseWhitespace: true,
			conservativeCollapse: true,
			preserveLineBreaks: true,
			keepClosingSlash: true,
			minifyCSS: true,
			minifyJS: true,
			processScripts: ["text/partytown"],
			quoteCharacter: '"',
			sortAttributes: true,
			sortClassName: true,
		}),
	],
	vite: {
		publicDir: "public",
		plugins: [tailwindVite() as any],
		optimizeDeps: {
			// COOP/COEP設定時に必要
			exclude: ["@js-joda/core"],
		},
		build: {
			minify: true,
			copyPublicDir: true,
			terserOptions: {
				ecma: 2020,
				module: true,
				compress: {
					ecma: 2020,
					inline: 3,
					passes: 3,
					arrows: true,
					booleans: false,
					comparisons: true,
					unsafe: false,
					dead_code: true,
					drop_console: false,
					drop_debugger: true,
				},
				mangle: {
					toplevel: false,
					safari10: true,
				},
				format: {
					comments: "some",
				},
			},
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes("node_modules")) {
							return "vendor";
						}
					},
				},
				external: [],
			},
		},
	},
	env: {
		schema: {
			BASE_DIR: envField.string(envFieldSetting),
			AUTHOR: envField.string(envFieldSetting),
			SITE_TITLE: envField.string(envFieldSetting),
			SITE_DESCRIPTION: envField.string(envFieldSetting),

			GTAG_ID: envField.string(envFieldSetting),
		},
	},
});
