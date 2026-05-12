import { a as createComponent, m as maybeRenderHead, f as addAttribute, ez as createTransitionScope, d as renderComponent, eA as $$Bars3, et as $$XMark, b as renderScript, r as renderTemplate, c as createAstro, e as renderSlot, g as renderHead, eB as $$ClientRouter, ev as unescapeHTML, $ as $$SEO } from './vendor-DXfDt0er.js';
import 'piccolore';
import { c as $$ThemeToggle, d as $$NavLinks, e as $$Logo, f as SITE_URL, B as BASE_DIR, A as AUTHOR, S as SITE_TITLE, a as SITE_DESCRIPTION, $ as $$Footer, b as $$Header, G as GTAG_ID } from './Header-Chofjt6D.js';
/* empty css               */

const pwaAssetsHead = {"links":[{"href":"/bio/favicon.ico","rel":"icon","sizes":"48x48"},{"href":"/bio/favicon.svg","rel":"icon","sizes":"any","type":"image/svg+xml"},{"href":"/bio/apple-touch-icon-180x180.png","rel":"apple-touch-icon"}],"themeColor":{"content":"#1D396F"}};

const pwaInfo = {"webManifest":{"href":"/bio/manifest.webmanifest"}};

const $$FloatingHeader = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="md:hidden"${addAttribute(createTransitionScope($$result, "y2opjsap"), "data-astro-transition-persist")}> <input type="checkbox" id="mobile-menu-toggle" class="peer hidden"> <label for="mobile-menu-toggle" class="fixed top-4 right-4 z-40 p-2 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg cursor-pointer" aria-label="メニューを開く" tabindex="0" role="button" aria-pressed="false" aria-controls="mobile-nav"> ${renderComponent($$result, "Bars3Icon", $$Bars3, { "class": "w-6 h-6 text-slate-800 dark:text-slate-200" })} </label> <label for="mobile-menu-toggle" class="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto transition-opacity duration-300" aria-hidden="true"></label> <nav id="mobile-nav" class="fixed top-0 right-0 z-40 h-full w-64 bg-white dark:bg-slate-900 shadow-xl p-6 transition-transform duration-300 translate-x-full peer-checked:translate-x-0" aria-hidden="true"> <div class="flex justify-between items-center mb-8"> <span class="text-xl font-bold">Menu</span> <div class="flex flex-nowrap"> ${renderComponent($$result, "ThemeToggle", $$ThemeToggle, {})} <button id="mobile-menu-close-button" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="閉じる"> ${renderComponent($$result, "XMarkIcon", $$XMark, { "class": "w-6 h-6 text-slate-700 dark:text-slate-300" })} </button> </div> </div> ${renderComponent($$result, "NavLinks", $$NavLinks, { "class": "space-y-4 list-none", "itemClass": "block text-xl font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400" })} </nav> </div> <header id="floating-header" class="hidden md:block fixed top-0 left-0 right-0 z-20 py-3 px-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm transition-transform duration-300 -translate-y-full" role="banner"> <nav class="max-w-5xl mx-auto flex justify-between items-center"> ${renderComponent($$result, "Logo", $$Logo, { "id": "floating-logo", "class": "text-xl" })} <div class="flex items-center space-x-6"> ${renderComponent($$result, "NavLinks", $$NavLinks, { "class": "flex space-x-6 list-none", "itemClass": "text-base font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" })} ${renderComponent($$result, "ThemeToggle", $$ThemeToggle, {})} </div> </nav> </header> ${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/components/FloatingHeader.astro?astro&type=script&index=0&lang.ts")} ${renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/components/FloatingHeader.astro?astro&type=script&index=1&lang.ts")}`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/FloatingHeader.astro", "self");

function createUrl(pathname) {
  const url = new URL(pathname, SITE_URL);
  const isFile = /\.[a-z0-9]+$/i.test(url.pathname);
  if (!isFile && !url.pathname.endsWith("/")) {
    url.pathname += "/";
  }
  return url.toString();
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
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
    { name: "application-name", content: SITE_TITLE },
    { name: "apple-mobile-web-app-title", content: SITE_TITLE },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    { name: "apple-mobile-web-app-title", content: SITE_TITLE }
  ];
  if (pwaAssetsHead.themeColor) {
    metaArr.push({ name: "theme-color", content: pwaAssetsHead.themeColor.content });
  }
  const { title, description = SITE_DESCRIPTION } = Astro2.props;
  const topUrl = createUrl(BASE_DIR);
  const currentUrl = createUrl(Astro2.url.pathname);
  const personId = `${topUrl}#person`;
  const websiteId = `${topUrl}#website`;
  const webpageId = `${currentUrl}#webpage`;
  const breadcrumbs = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Top",
      item: topUrl
    }
  ];
  if (Astro2.url.pathname !== BASE_DIR) {
    breadcrumbs.push({
      "@type": "ListItem",
      position: 2,
      name: title,
      item: currentUrl
    });
  }
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: AUTHOR,
        alternateName: "snows",
        url: topUrl,
        image: createUrl(`${BASE_DIR}pwa-512x512.png`),
        sameAs: ["https://github.com/hi2ma-bu4", "https://twitter.com/hi2ma_bu4"]
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_TITLE,
        url: topUrl,
        description: SITE_DESCRIPTION,
        inLanguage: "ja",
        publisher: {
          "@id": personId
        },
        author: {
          "@id": personId
        }
      },
      {
        "@type": "WebPage",
        "@id": webpageId,
        name: title,
        url: currentUrl,
        description,
        inLanguage: "ja",
        isPartOf: {
          "@id": websiteId
        },
        about: {
          "@id": personId
        },
        breadcrumb: {
          "@id": `${currentUrl}#breadcrumb`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${currentUrl}#breadcrumb`,
        itemListElement: breadcrumbs
      }
    ]
  };
  return renderTemplate(_a || (_a = __template(['<html lang="ja" prefix="og: https://ogp.me/ns#" data-overlayscrollbars-initialize> <head prefix="website: https://ogp.me/ns/website#">', '<script type="application/ld+json">', "<\/script>", "", "", "", '<link rel="dns-prefetch" href="//www.googletagmanager.com"><script async', "><\/script>", '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preload" as="style" fetchpriority="high" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap">', `<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap" media="print" onload="this.media='all'"></noscript>`, '</head> <body class="min-h-screen flex flex-col w-full" data-overlayscrollbars-initialize> <!-- Google Tag Manager (noscript) --> <noscript><iframe', ' height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript> <!-- End Google Tag Manager (noscript) --> ', " ", ' <div id="bg-canvas"', '></div> <main class="grow w-full max-w-5xl mx-auto px-4 py-8 md:px-8" role="main"> ', " </main> ", " ", " ", " ", " ", " ", " </body> </html>"])), renderComponent($$result, "SEO", $$SEO, { "charset": "UTF-8", "title": title, "titleDefault": "Page", "titleTemplate": `%s | ${SITE_TITLE}`, "description": description, "openGraph": {
    basic: {
      title,
      type: "website",
      image: createUrl(`${BASE_DIR}maskable-icon-512x512.png`)
    },
    optional: {
      description,
      locale: "ja_JP",
      siteName: SITE_TITLE
    }
  }, "twitter": { creator: "@hi2ma_bu4", card: "summary" }, "extend": {
    link: linkArr,
    meta: metaArr
  } }), unescapeHTML(JSON.stringify(structuredData)), renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts"), renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=1&lang.ts"), renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=2&lang.ts"), renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=3&lang.ts"), addAttribute(`${BASE_DIR}assets/js/static/auto-gtag.js`, "src"), renderComponent($$result, "ClientRouter", $$ClientRouter, {}), maybeRenderHead(), renderHead(), addAttribute(`https://www.googletagmanager.com/ns.html?id=${GTAG_ID}`, "src"), renderComponent($$result, "Header", $$Header, {}), renderComponent($$result, "FloatingHeader", $$FloatingHeader, {}), addAttribute(createTransitionScope($$result, "gbvijb6a"), "data-astro-transition-persist"), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, {}), renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=4&lang.ts"), renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=5&lang.ts"), renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=6&lang.ts"), renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=7&lang.ts"), renderScript($$result, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro?astro&type=script&index=8&lang.ts"));
}, "C:/Users/snows/Documents/Program/js/bio/src/layouts/Layout.astro", "self");

export { $$Layout as $, createUrl as c };
//# sourceMappingURL=Layout-tVjyTPgd.js.map
