import "dotenv/config";

import path from "node:path";

import { defineConfig, envField } from "astro/config";

import astroLlmsTxt from "@4hse/astro-llms-txt";
import sitemap from "@astrojs/sitemap";
import solidJs from "@astrojs/solid-js";
import tailwindVite from "@tailwindcss/vite";
import { minimal2023Preset as preset } from "@vite-pwa/assets-generator/config";
import AstroPWA from "@vite-pwa/astro";
import htmlMinifierNext from "astro-html-minifier-next";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import type { PreRenderedAsset, PreRenderedChunk } from "rollup";
import { visualizer } from "rollup-plugin-visualizer";
import { type MinifyOptions } from "terser";

import generateDarkIcons from "./dev/integrations/generateDarkIcons";
import inline404Integration from "./dev/integrations/inline404";
import staticTsCompile from "./dev/integrations/staticTsCompile";
import typecheckIntegration from "./dev/integrations/typecheck";

const BASE_DIR = process.env.BASE_DIR ?? "/";
const SITE_TITLE = process.env.SITE_TITLE ?? "snowsSite";

const envFieldSetting = {
	context: "client",
	access: "public",
} as const;

const terserOpt: MinifyOptions = {
	ecma: 2020,
	module: true,
	compress: {
		ecma: 2020,
		inline: 3,
		passes: 5,
		hoist_props: true,
		arrows: true,
		booleans: false,
		comparisons: true,
		unsafe: false,
		dead_code: true,
		drop_console: false,
		drop_debugger: true,
		side_effects: true,
		keep_infinity: true,
	},
	mangle: {
		toplevel: false,
		safari10: true,
	},
	format: {
		comments: "some",
		safari10: true,
	},
} as const;

const browserTargets = browserslistToTargets(browserslist("> 3% in JP"));

const PREFIX_RULES = [
	// node_modules
	{ keyword: "@tsparticles", name: "@tsparticles" },
	{ keyword: "matter-js", name: "matter-js" },
	{ keyword: "solid-js", name: "solid-js" },
	{ keyword: "qrcode", name: "qrcode" },
	// その他vendor
	{ keyword: "node_modules", name: "vendor" },
	// libs
	{ keyword: "pseudo-debugkit", name: "pseudo-debugkit" },
	{ keyword: "theme-utils", name: "theme-utils" },
	{ keyword: "ui-utils", name: "ui-utils" },
];

const DYNAMIC_RULES = [
	{ keyword: "tsparticles", prefix: "tsparticles" },
	{ keyword: "day-effect", name: "day-effect" },
	{ keyword: "key-command", prefix: "key-command" },
];

export default defineConfig({
	output: "static",
	outDir: "dist",
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
		generateDarkIcons({
			darkSrc: "public/favicon-dark.svg",
			outDir: "dist/",
		}),
		staticTsCompile({
			srcDir: "src/static_script/",
			outDir: "dist/assets/js/static/",
			terserSetting: terserOpt,
		}),
		typecheckIntegration(),
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
						sizes: "any",
						type: "image/svg+xml",
						purpose: "any monochrome",
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
				globIgnores: ["**/hyWenHei.ttf"],
				maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
				runtimeCaching: [
					// Google Fonts
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: "CacheFirst",
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: "CacheFirst",
					},
					// CDN
					{
						urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
						handler: "StaleWhileRevalidate",
					},
					// API キャッシュ
					{
						urlPattern: /^https:\/\/api\./,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-cache",
							networkTimeoutSeconds: 2,
						},
					},
				],
			},
		}),
		sitemap({
			changefreq: "weekly",
			priority: 0.8,
			lastmod: new Date(),
			filter: (page) => !page.includes("/404/"),
		}),
		htmlMinifierNext({
			collapseInlineTagWhitespace: true,
			collapseWhitespace: true,
			conservativeCollapse: true,
			preserveLineBreaks: true,
			keepClosingSlash: true,
			minifyJS: terserOpt,
			minifyCSS: {
				targets: browserTargets,
			},
			processScripts: ["text/partytown"],
			quoteCharacter: '"',
			sortAttributes: true,
			sortClassNames: true,
		}),
		inline404Integration(),
		astroLlmsTxt({
			title: SITE_TITLE,
			description: process.env.SITE_DESCRIPTION,
			notes: "- This content is generated by astro-llms-txt.",
			optionalLinks: [
				{
					label: "GitHub",
					url: "https://github.com/hi2ma-bu4",
					description: "My GitHub profile.",
				},
			],
			docSet: [
				{
					title: "Complete site",
					description: `The Full site of ${SITE_TITLE}`,
					url: `/llms-full.txt`,
					include: ["/", `*/**`],
					promote: ["/"],
				},
				{
					title: "Small site",
					description: `Index of key pages`,
					url: `/llms-small.txt`,
					include: ["/", `*/**`],
					onlyStructure: true,
					promote: ["/"],
				},
			],
			pageSeparator: "\n\n---\n\n",
		}),
	],
	vite: {
		publicDir: "public",
		plugins: [
			tailwindVite({
				optimize: {
					minify: true,
				},
			}) as Plugin[],
			visualizer({
				filename: "./reports/stats.html",
				open: false,
				gzipSize: true,
				brotliSize: true,
				sourcemap: true,
			}),
		],
		optimizeDeps: {
			exclude: [],
		},
		build: {
			minify: true,
			sourcemap: true,
			copyPublicDir: true,
			assetsInlineLimit: 0,
			terserOptions: terserOpt,
			rollupOptions: {
				cache: true,
				output: {
					entryFileNames(chunkInfo: PreRenderedChunk): string {
						const { name } = path.parse(chunkInfo.name);
						return `assets/js/${name}-[hash].js`;
					},
					chunkFileNames(chunkInfo: PreRenderedChunk): string {
						const { name } = path.parse(chunkInfo.name);
						return `assets/js/chunks/${name}-[hash].js`;
					},
					assetFileNames(chunkInfo: PreRenderedAsset): string {
						const { ext, name } = path.parse(chunkInfo.names[0]);
						switch (ext) {
							case ".css":
								return `assets/css/${name}-[hash][extname]`;
							case ".png":
							case ".jpg":
							case ".jpeg":
							case ".webp":
							case ".svg":
								return `assets/imgs/${name}-[hash][extname]`;
						}
						return `assets/${name}-[hash][extname]`;
					},
					manualChunks(id) {
						// 単純マッチ
						for (const rule of PREFIX_RULES) {
							if (id.includes(rule.keyword)) return rule.name;
						}

						// 動的マッチ
						for (const rule of DYNAMIC_RULES) {
							if (id.includes(rule.keyword)) {
								const match = id.match(new RegExp(`${rule.keyword}/[^/]+`));
								return match ? `${rule.prefix}-${match[0]}` : rule.prefix;
							}
						}
					},
					strict: true,
				},
				external: [],
				onwarn(warning, warn) {
					// 不要な警告を無視
					if (warning.message.includes("Sourcemap is likely to be incorrect")) return;
					warn(warning);
				},
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
			GA4_TAG: envField.string(envFieldSetting),
		},
	},
});
