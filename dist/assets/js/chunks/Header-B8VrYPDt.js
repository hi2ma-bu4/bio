import { a as createComponent, m as maybeRenderHead, r as renderTemplate, c as createAstro, s as spreadAttributes, f as addAttribute, ez as createTransitionScope, d as renderComponent, eC as $$Sun, eD as $$Moon } from './vendor-COsIsGnh.js';
import 'piccolore';
import 'clsx';

const BASE_DIR = "/bio/";const AUTHOR = "hi2ma-bu4";const SITE_TITLE = "snowsSite";const SITE_DESCRIPTION = "snows(hi2ma-bu4)の個人サイトです。";const GTAG_ID = "GTM-N2NZ68ZJ";

const NAV_LINKS = [
  { href: BASE_DIR, text: "Top" },
  { href: `${BASE_DIR}works/`, text: "Works" },
  { href: `${BASE_DIR}link/`, text: "Link" }
];
const CLASS_AUTO_IMG_ALT = "auto-img-alt";

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return renderTemplate`${maybeRenderHead()}<footer class="w-full mt-16 py-8 bg-slate-100 dark:bg-slate-800"> <div class="max-w-5xl mx-auto px-4 md:px-8 text-center" role="contentinfo"> <p class="text-slate-600 dark:text-slate-400">
&copy; ${year} <a href="https://github.com/hi2ma-bu4" target="_blank" rel="noopener noreferrer" class="hover:text-slate-400 dark:hover:text-slate-600 hover:underline transition-colors">${AUTHOR}</a>. All rights reserved.
</p> </div> </footer>`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/Footer.astro", void 0);

const $$Astro$1 = createAstro("https://hi2ma-bu4.github.io/");
const $$CircleHalfStroke = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CircleHalfStroke;
  return renderTemplate`${maybeRenderHead()}<svg${spreadAttributes(Astro2.props)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" role="img" data-slot="icon"> <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> <path d="M512 320C512 214 426 128 320 128L320 512C426 512 512 426 512 320zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z"></path> </svg>`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/icon/CircleHalfStroke.astro", void 0);

const $$file = "C:/Users/snows/Documents/Program/js/bio/src/components/icon/CircleHalfStroke.astro";
const $$url = undefined;

const __vite_glob_0_1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$CircleHalfStroke,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const $$ThemeToggle = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<button class="theme-toggle p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-800 dark:text-slate-200" aria-label="テーマを切り替える" type="button"${addAttribute(createTransitionScope($$result, "wppfukqh"), "data-astro-transition-persist")}> <span class="icon-sun hidden">${renderComponent($$result, "SunIcon", $$Sun, { "class": "w-6 h-6" })}</span> <span class="icon-moon hidden">${renderComponent($$result, "MoonIcon", $$Moon, { "class": "w-6 h-6" })}</span> <span class="icon-auto hidden">${renderComponent($$result, "CircleHalfStroke", $$CircleHalfStroke, { "class": "w-6 h-6" })}</span> </button>`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/ThemeToggle.astro", "self");

const $$Astro = createAstro("https://hi2ma-bu4.github.io/");
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Header;
  return renderTemplate`${maybeRenderHead()}<header id="main-header" class="w-full py-4 px-4 md:px-8 transition-transform duration-300" role="banner"${addAttribute(createTransitionScope($$result, "l7r54iwe"), "data-astro-transition-persist")}> <nav class="max-w-5xl mx-auto flex justify-between items-center"> <a${addAttribute(BASE_DIR, "href")} id="logo" class="text-2xl font-bold text-primary-600 dark:text-primary-400" data-astro-reload>${SITE_TITLE}</a> <div class="hidden md:flex items-center space-x-6"> ${NAV_LINKS.map((link) => renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute(["text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors", { "font-bold text-primary-600 dark:text-primary-400": Astro2.url.pathname === link.href }], "class:list")}${addAttribute(Astro2.url.pathname === link.href ? "page" : false, "aria-current")}> ${link.text} </a>`)} ${renderComponent($$result, "ThemeToggle", $$ThemeToggle, {})} </div> </nav> </header>`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/Header.astro", "self");

export { $$Footer as $, AUTHOR as A, BASE_DIR as B, CLASS_AUTO_IMG_ALT as C, GTAG_ID as G, NAV_LINKS as N, SITE_TITLE as S, __vite_glob_0_1 as _, SITE_DESCRIPTION as a, $$Header as b, $$ThemeToggle as c };
//# sourceMappingURL=Header-B8VrYPDt.js.map
