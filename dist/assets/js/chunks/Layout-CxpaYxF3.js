import { c as createAstro, a as createComponent, m as maybeRenderHead, f as addAttribute, ey as createTransitionScope, r as renderComponent, ez as $$Bars3, eu as $$XMark, h as renderTemplate, b as renderScript, $ as $$SEO, eA as $$ClientRouter, d as $$GoogleFontsOptimizer, e as renderHead, g as renderSlot } from './vendor-C4FbIaAb.js';
import 'piccolore';
import { S as SITE_TITLE, d as $$ThemeToggle, N as NAV_LINKS, B as BASE_DIR, A as AUTHOR, a as SITE_DESCRIPTION, $ as $$GoogleAnalytics, G as GTAG_ID, b as $$Header, c as $$Footer } from './Header-Ci1VnVsb.js';
/* empty css               */

const pwaAssetsHead = {"links":[{"href":"/bio/favicon.ico","rel":"icon","sizes":"48x48"},{"href":"/bio/favicon.svg","rel":"icon","sizes":"any","type":"image/svg+xml"},{"href":"/bio/apple-touch-icon-180x180.png","rel":"apple-touch-icon"}],"themeColor":{"content":"#1D396F"}};

const pwaInfo = {"webManifest":{"href":"/bio/manifest.webmanifest"}};

const $$Astro$1 = createAstro("https://hi2ma-bu4.github.io/");
const $$FloatingHeader = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$FloatingHeader;
  return renderTemplate`${maybeRenderHead()}<div class="md:hidden"${addAttribute(createTransitionScope($$result, "y2opjsap"), "data-astro-transition-persist")}> <input type="checkbox" id="mobile-menu-toggle" class="peer hidden"> <label for="mobile-menu-toggle" class="fixed top-4 right-4 z-40 p-2 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg cursor-pointer" aria-label="メニューを開く" tabindex="0" role="button" aria-pressed="false" aria-controls="mobile-nav"> ${renderComponent($$result, "Bars3Icon", $$Bars3, { "class": "w-6 h-6 text-slate-800 dark:text-slate-200" })} </label> <label for="mobile-menu-toggle" class="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto transition-opacity duration-300" aria-hidden="true"></label> <nav id="mobile-nav" class="fixed top-0 right-0 z-40 h-full w-64 bg-white dark:bg-slate-900 shadow-xl p-6 transition-transform duration-300 translate-x-full peer-checked:translate-x-0" aria-hidden="true"> <div class="flex justify-between items-center mb-8"> <span class="text-xl font-bold">Menu</span> <div class="flex flex-nowrap"> ${renderComponent($$result, "ThemeToggle", $$ThemeToggle, {})} <button id="mobile-menu-close-button" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="閉じる"> ${renderComponent($$result, "XMarkIcon", $$XMark, { "class": "w-6 h-6 text-slate-700 dark:text-slate-300" })} </button> </div> </div> <ul class="space-y-4"> ${NAV_LINKS.map((link) => renderTemplate`<li> <a${addAttribute(link.href, "href")}${addAttribute(["block text-xl font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400", { "font-bold text-primary-600 dark:text-primary-400": Astro2.url.pathname === link.href }], "class:list")}${addAttribute(Astro2.url.pathname === link.href ? "page" : false, "aria-current")}> ${link.text} </a> </li>`)} </ul> </nav> </div> <header id="floating-header" class="hidden md:block fixed top-0 left-0 right-0 z-20 py-3 px-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm transition-transform duration-300 -translate-y-full" role="banner"> <nav class="max-w-5xl mx-auto flex justify-between items-center"> <a${addAttribute(BASE_DIR, "href")} id="floating-logo" class="text-xl font-bold text-primary-600 dark:text-primary-400">${SITE_TITLE}</a> <div class="flex items-center space-x-6"> ${NAV_LINKS.map((link) => renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute(["text-base font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors", { "font-bold text-primary-600 dark:text-primary-400": Astro2.url.pathname === link.href }], "class:list")}${addAttribute(Astro2.url.pathname === link.href ? "page" : false, "aria-current")}> ${link.text} </a>`)} ${renderComponent($$result, "ThemeToggle", $$ThemeToggle, {})} </div> </nav> </header> ${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/components/FloatingHeader.astro?astro&type=script&index=0&lang.ts")} ${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/components/FloatingHeader.astro?astro&type=script&index=1&lang.ts")}`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/FloatingHeader.astro", "self");

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
  return renderTemplate`<html lang="ja" prefix="og: https://ogp.me/ns#" data-overlayscrollbars-initialize> <head prefix="website: https://ogp.me/ns/website#">${renderComponent($$result, "SEO", $$SEO, { "charset": "UTF-8", "title": title, "titleDefault": "Page", "titleTemplate": `%s | ${SITE_TITLE}`, "description": description, "openGraph": {
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
  } })}${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")}${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=1&lang.ts")}${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=2&lang.ts")}${renderComponent($$result, "GoogleAnalytics", $$GoogleAnalytics, {})}${renderComponent($$result, "ClientRouter", $$ClientRouter, {})}<link rel="preconnect" href="https://fonts.googleapis.com">${renderComponent($$result, "GoogleFontsOptimizer", $$GoogleFontsOptimizer, { "url": "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap" })}${renderHead()}</head> <body class="min-h-screen flex flex-col w-full" data-overlayscrollbars-initialize> <!-- Google Tag Manager (noscript) --> <noscript><iframe${addAttribute(`https://www.googletagmanager.com/ns.html?id=${GTAG_ID}`, "src")} height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript> <!-- End Google Tag Manager (noscript) --> ${renderComponent($$result, "Header", $$Header, {})} ${renderComponent($$result, "FloatingHeader", $$FloatingHeader, {})} <div id="bg-canvas"${addAttribute(createTransitionScope($$result, "mrg5k34m"), "data-astro-transition-persist")}></div> <main class="grow w-full max-w-5xl mx-auto px-4 py-8 md:px-8" role="main"> ${renderSlot($$result, $$slots["default"])} </main> ${renderComponent($$result, "Footer", $$Footer, {})} ${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=3&lang.ts")} ${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=4&lang.ts")} ${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=5&lang.ts")} ${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=6&lang.ts")} ${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=7&lang.ts")} </body> </html>`;
}, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro", "self");

export { $$Layout as $ };
