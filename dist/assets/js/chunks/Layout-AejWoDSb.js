import { c as createAstro, a as createComponent, m as maybeRenderHead, s as spreadAttributes, r as renderTemplate, ek as addAttribute, el as renderComponent, es as createTransitionScope, et as $$Sun, eu as $$Moon, eo as renderScript, ev as $$Bars3, en as $$XMark, ep as defineScriptVars, ew as renderHead, ex as renderSlot, ey as $$SEO, ez as $$ClientRouter, eA as $$GoogleFontsOptimizer } from './vendor-CY-O8yK5.js';
import 'piccolore';
import 'clsx';
/* empty css                        */

const $$Astro$3 = createAstro("https://hi2ma-bu4.github.io/");
const $$CircleHalfStroke = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$CircleHalfStroke;
  return renderTemplate`${maybeRenderHead()}<svg${spreadAttributes(Astro2.props)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" data-slot="icon"> <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> <path d="M512 320C512 214 426 128 320 128L320 512C426 512 512 426 512 320zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z"></path> </svg>`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/icon/CircleHalfStroke.astro", void 0);

const $$file = "C:/Users/snows/Documents/Program/js/bio/src/components/icon/CircleHalfStroke.astro";
const $$url = undefined;

const __vite_glob_0_0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$CircleHalfStroke,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const pwaAssetsHead = {"links":[{"href":"/bio/favicon.ico","rel":"icon","sizes":"48x48"},{"href":"/bio/favicon.svg","rel":"icon","sizes":"any","type":"image/svg+xml"},{"href":"/bio/apple-touch-icon-180x180.png","rel":"apple-touch-icon"}],"themeColor":{"content":"#1D396F"}};

const pwaInfo = {"webManifest":{"href":"/bio/manifest.webmanifest"}};

const BASE_DIR = "/bio/";const AUTHOR = "hi2ma-bu4";const SITE_TITLE = "snowsSite";const SITE_DESCRIPTION = "snows(hi2ma-bu4)の個人サイトです。";const GTAG_ID = "GTM-N2NZ68ZJ";const GA4_TAG = "G-Y5FMM4MPMV";

const NAV_LINKS = [
  { href: BASE_DIR, text: "Top" },
  { href: `${BASE_DIR}works/`, text: "Works" },
  { href: `${BASE_DIR}link/`, text: "Link" }
];
const CLASS_AUTO_IMG_ALT = "auto-img-alt";

const $$ThemeToggle = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<button class="theme-toggle p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="テーマを切り替える" type="button"${addAttribute(createTransitionScope($$result, "wppfukqh"), "data-astro-transition-persist")}> <span class="icon-sun hidden">${renderComponent($$result, "SunIcon", $$Sun, { "class": "w-6 h-6 text-slate-800" })}</span> <span class="icon-moon hidden">${renderComponent($$result, "MoonIcon", $$Moon, { "class": "w-6 h-6 text-slate-200" })}</span> <span class="icon-auto hidden">${renderComponent($$result, "CircleHalfStroke", $$CircleHalfStroke, { "class": "w-6 h-6 text-slate-800 dark:text-slate-200" })}</span> </button>`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/ThemeToggle.astro", "self");

const $$Astro$2 = createAstro("https://hi2ma-bu4.github.io/");
const $$FloatingHeader = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$FloatingHeader;
  return renderTemplate`${maybeRenderHead()}<div class="md:hidden"${addAttribute(createTransitionScope($$result, "y2opjsap"), "data-astro-transition-persist")}> <input type="checkbox" id="mobile-menu-toggle" class="peer hidden"> <label for="mobile-menu-toggle" class="fixed top-4 right-4 z-40 p-2 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg cursor-pointer" aria-label="メニューを開く" tabindex="0" role="button" aria-pressed="false" aria-controls="mobile-nav"> ${renderComponent($$result, "Bars3Icon", $$Bars3, { "class": "w-6 h-6 text-slate-800 dark:text-slate-200" })} </label> <label for="mobile-menu-toggle" class="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto transition-opacity duration-300" aria-hidden="true"></label> <nav id="mobile-nav" class="fixed top-0 right-0 z-40 h-full w-64 bg-white dark:bg-slate-900 shadow-xl p-6 transition-transform duration-300 translate-x-full peer-checked:translate-x-0" aria-hidden="true"> <div class="flex justify-between items-center mb-8"> <span class="text-xl font-bold">Menu</span> <div class="flex flex-nowrap"> ${renderComponent($$result, "ThemeToggle", $$ThemeToggle, {})} <button id="mobile-menu-close-button" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="閉じる"> ${renderComponent($$result, "XMarkIcon", $$XMark, { "class": "w-6 h-6 text-slate-700 dark:text-slate-300" })} </button> </div> </div> <ul class="space-y-4"> ${NAV_LINKS.map((link) => renderTemplate`<li> <a${addAttribute(link.href, "href")}${addAttribute(["block text-xl font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400", { "font-bold text-sky-600 dark:text-sky-400": Astro2.url.pathname === link.href }], "class:list")}${addAttribute(Astro2.url.pathname === link.href ? "page" : false, "aria-current")}> ${link.text} </a> </li>`)} </ul> </nav> </div> <header id="floating-header" class="hidden md:block fixed top-0 left-0 right-0 z-20 py-3 px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm transition-transform duration-300 -translate-y-full" role="banner"> <nav class="max-w-5xl mx-auto flex justify-between items-center"> <a${addAttribute(BASE_DIR, "href")} class="text-xl font-bold text-sky-600 dark:text-sky-400">${SITE_TITLE}</a> <div class="flex items-center space-x-6"> ${NAV_LINKS.map((link) => renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute(["text-base font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors", { "font-bold text-sky-600 dark:text-sky-400": Astro2.url.pathname === link.href }], "class:list")}${addAttribute(Astro2.url.pathname === link.href ? "page" : false, "aria-current")}> ${link.text} </a>`)} ${renderComponent($$result, "ThemeToggle", $$ThemeToggle, {})} </div> </nav> </header> ${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/components/FloatingHeader.astro?astro&type=script&index=0&lang.ts")} ${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/components/FloatingHeader.astro?astro&type=script&index=1&lang.ts")}`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/FloatingHeader.astro", "self");

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return renderTemplate`${maybeRenderHead()}<footer class="w-full mt-16 py-8 bg-slate-100 dark:bg-slate-800"> <div class="max-w-5xl mx-auto px-4 md:px-8 text-center" role="contentinfo"> <p class="text-slate-600 dark:text-slate-400">
&copy; ${year} <a href="https://github.com/hi2ma-bu4" target="_blank" rel="noopener noreferrer" class="hover:text-slate-400 dark:hover:text-slate-600 hover:underline transition-colors">${AUTHOR}</a>. All rights reserved.
</p> </div> </footer>`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/Footer.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$GoogleAnalytics = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(['<script type="text/partytown"', ' data-astro-rerun><\/script> <script type="text/partytown" data-astro-rerun>(function(){', '\n	window.dataLayer = window.dataLayer || [];\n	window.gtag = function gtag() {\n		dataLayer.push(arguments);\n	};\n	gtag("js", new Date());\n	gtag("config", GTAG_ID);\n	gtag("config", GA4_TAG);\n})();<\/script>'])), addAttribute(`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`, "src"), defineScriptVars({ GTAG_ID, GA4_TAG }));
}, "C:/Users/snows/Documents/Program/js/bio/src/components/GoogleAnalytics.astro", void 0);

const $$Astro$1 = createAstro("https://hi2ma-bu4.github.io/");
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Header;
  return renderTemplate`${maybeRenderHead()}<header id="main-header" class="w-full py-4 px-4 md:px-8 transition-transform duration-300" role="banner"${addAttribute(createTransitionScope($$result, "l7r54iwe"), "data-astro-transition-persist")}> <nav class="max-w-5xl mx-auto flex justify-between items-center"> <a${addAttribute(BASE_DIR, "href")} class="text-2xl font-bold text-sky-600 dark:text-sky-400" data-astro-reload>${SITE_TITLE}</a> <div class="hidden md:flex items-center space-x-6"> ${NAV_LINKS.map((link) => renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute(["text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors", { "font-bold text-sky-600 dark:text-sky-400": Astro2.url.pathname === link.href }], "class:list")}${addAttribute(Astro2.url.pathname === link.href ? "page" : false, "aria-current")}> ${link.text} </a>`)} ${renderComponent($$result, "ThemeToggle", $$ThemeToggle, {})} </div> </nav> </header>`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/Header.astro", "self");

const $$Astro = createAstro("https://hi2ma-bu4.github.io/");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const linkArr = [];
  const mediaLight = "(prefers-color-scheme: light)";
  const mediaDark = "(prefers-color-scheme: dark)";
  pwaAssetsHead.links.map((link) => ({ ...link })).forEach((link) => {
    linkArr.push(link);
    if (link.rel === "icon") {
      let newLink;
      switch (link.href.split(".").pop()) {
        case "ico":
          link.media = mediaLight;
          newLink = { ...link };
          newLink.href = `${BASE_DIR}favicon-dark.ico`;
          break;
        case "svg":
          link.media = mediaLight;
          newLink = { ...link };
          newLink.href = `${BASE_DIR}favicon-dark.svg`;
          break;
      }
      if (newLink) {
        newLink.media = mediaDark;
        linkArr.push(newLink);
      }
    }
  });
  linkArr.push({ rel: "sitemap", href: `${BASE_DIR}sitemap-index.xml` });
  if (pwaInfo) {
    linkArr.push({ rel: "manifest", href: pwaInfo.webManifest.href });
  }
  const metaArr = [
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    { name: "format-detection", content: "telephone=no, address=no, email=no" },
    { name: "author", content: AUTHOR },
    { name: "generator", content: Astro2.generator },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    { name: "apple-mobile-web-app-title", content: SITE_TITLE }
  ];
  if (pwaAssetsHead.themeColor) {
    metaArr.push({ name: "theme-color", content: pwaAssetsHead.themeColor.content });
  }
  const { title, description = SITE_DESCRIPTION } = Astro2.props;
  return renderTemplate`<html lang="ja" prefix="og: https://ogp.me/ns#"> <head prefix="website: https://ogp.me/ns/website#">${renderComponent($$result, "SEO", $$SEO, { "charset": "UTF-8", "title": title, "titleDefault": "Page", "titleTemplate": `%s | ${SITE_TITLE}`, "description": description, "openGraph": {
    basic: {
      title,
      type: "website",
      image: BASE_DIR + "maskable-icon-512x512.png"
    },
    optional: {
      description,
      locale: "ja_JP",
      siteName: SITE_TITLE
    }
  }, "twitter": { creator: "@hi2ma_bu4", card: "summary" }, "extend": {
    link: linkArr,
    meta: metaArr
  } })}${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")}${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=1&lang.ts")}${renderComponent($$result, "GoogleAnalytics", $$GoogleAnalytics, {})}${renderComponent($$result, "ClientRouter", $$ClientRouter, {})}<link rel="preconnect" href="https://fonts.googleapis.com">${renderComponent($$result, "GoogleFontsOptimizer", $$GoogleFontsOptimizer, { "url": "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap" })}${renderHead()}</head> <body class="min-h-screen flex flex-col"> <!-- Google Tag Manager (noscript) --> <noscript><iframe${addAttribute(`https://www.googletagmanager.com/ns.html?id=${GTAG_ID}`, "src")} height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript> <!-- End Google Tag Manager (noscript) --> ${renderComponent($$result, "Header", $$Header, {})} ${renderComponent($$result, "FloatingHeader", $$FloatingHeader, {})} <main class="grow w-full max-w-5xl mx-auto px-4 py-8 md:px-8" role="main"> ${renderSlot($$result, $$slots["default"])} </main> ${renderComponent($$result, "Footer", $$Footer, {})} ${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=2&lang.ts")} </body> </html>`;
}, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro", void 0);

export { $$Layout as $, BASE_DIR as B, CLASS_AUTO_IMG_ALT as C, __vite_glob_0_0 as _ };
