import { c as createAstro, a as createComponent, m as maybeRenderHead, f as addAttribute, r as renderComponent, ew as $$Picture, h as renderTemplate, j as $$ArrowTopRightOnSquare, ex as $$XMark, b as renderScript, ey as defineScriptVars } from './vendor-qhX5JPlG.js';
import 'piccolore';
import { a as $$GitHub, $ as $$Layout } from './Layout-C9vUJ7UA.js';
import { C as CLASS_AUTO_IMG_ALT, B as BASE_DIR } from './Header-C1g5yFl3.js';

function isImageMetadata(v) {
  return typeof v === "object" && v !== null && "src" in v;
}

const $$Astro = createAstro("https://hi2ma-bu4.github.io/");
const $$WorkCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$WorkCard;
  const { id, title, description, imageUrl, tags, directLink, githubLink } = Astro2.props;
  const isCardFooter = directLink || githubLink;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`work-card-${id}`, "id")} class="flex flex-col justify-between flex-nowrap group rounded-lg overflow-hidden shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"> <button class="work-modal-trigger w-full h-full flex flex-col text-left"${addAttribute(id, "data-work-id")} aria-haspopup="dialog"> <div class="aspect-video overflow-hidden"> ${isImageMetadata(imageUrl) ? renderTemplate`${renderComponent($$result, "Picture", $$Picture, { "src": imageUrl, "formats": ["avif", "webp"], "alt": `${title}\u306E\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8`, "fetchpriority": "low", "pictureAttributes": { class: "w-full h-full" }, "class": "object-cover transition-transform duration-300 group-hover:scale-105" })}` : renderTemplate`<img${addAttribute(imageUrl, "src")}${addAttribute(`${title}\u306E\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8`, "alt")} loading="lazy" decoding="async" fetchpriority="low" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">`} </div> <div class="p-4 md:p-6 pb-2 md:pb-2"> <h3 class="text-xl font-bold mb-2 text-slate-900 dark:text-white">${title}</h3> <p class="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">${description}</p> <div class="flex flex-wrap gap-2"> ${tags.map((tag) => renderTemplate`<span class="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">${tag}</span>`)} </div> </div> </button> ${isCardFooter && renderTemplate`<div class="p-4 md:p-6 pt-0 md:pt-0 flex flex-row gap-2"> ${directLink && renderTemplate`<a${addAttribute(directLink, "href")} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 transition-colors" onclick="event.stopPropagation()"${addAttribute(`${title}\u306E\u30B5\u30A4\u30C8\u3078\u79FB\u52D5`, "aria-label")}>
サイトへ移動
${renderComponent($$result, "ArrowTopRightOnSquareIcon", $$ArrowTopRightOnSquare, { "class": "w-4 h-4" })} </a>`} ${githubLink && renderTemplate`<a${addAttribute(githubLink, "href")} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-900 dark:text-gray-900 dark:bg-gray-400 dark:hover:bg-gray-300 focus-visible:ring-primary-500 transition-colors" onclick="event.stopPropagation()"${addAttribute(`${title}\u306EGitHub\u3078\u79FB\u52D5`, "aria-label")}> ${renderComponent($$result, "GitHub", $$GitHub, { "class": "w-5 h-5" })} </a>`} </div>`} </div>`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/WorkCard.astro", void 0);

const $$WorkModal = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<dialog id="work-modal" class="p-0 max-w-3xl w-11/12 rounded-lg shadow-xl bg-white dark:bg-slate-800 backdrop:bg-black/50 backdrop:backdrop-blur-sm inset-0 m-auto h-full overflow-visible"> <div id="work-modal-wrapper" class="w-full h-full"> <div id="modal-content" class="relative p-6 md:p-8"> <div class="text-center p-8"> <p>読み込み中...</p> </div> </div> <button id="modal-close-button" class="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="閉じる"> ${renderComponent($$result, "XMarkIcon", $$XMark, { "class": "w-6 h-6 text-slate-700 dark:text-slate-300" })} </button> </div> </dialog> <template id="work-modal-template"> <h4 class="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-white" data-template-id="title"></h4> <img src="" decoding="async" fetchpriority="low" alt=""${addAttribute(`w-full aspect-video object-cover rounded-md mb-6 ${CLASS_AUTO_IMG_ALT}`, "class")} data-template-id="image"> <p class="text-slate-700 dark:text-slate-300 mb-6" data-template-id="long-description"></p> <ul class="mb-6 space-y-0.5" data-template-id="other-urls"></ul> <div class="flex flex-wrap gap-2 mb-6" data-template-id="tags"></div> <div class="flex flex-row gap-2"> <a href="" target="_blank" rel="noopener noreferrer" class="hidden items-center gap-2 px-5 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 transition-colors" data-template-id="direct-link">
サイトへ移動
${renderComponent($$result, "ArrowTopRightOnSquareIcon", $$ArrowTopRightOnSquare, { "class": "w-4 h-4" })} </a> <a href="" target="_blank" rel="noopener noreferrer" class="hidden items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-900 dark:text-gray-900 dark:bg-gray-400 dark:hover:bg-gray-300 focus-visible:ring-primary-500 transition-colors" data-template-id="github-link"> ${renderComponent($$result, "GitHub", $$GitHub, { "class": "w-5 h-5" })} </a> </div> </template>`;
}, "C:/Users/snows/Documents/Program/js/bio/src/components/WorkModal.astro", void 0);

const imageKanjiSearch = new Proxy({"src":"/bio/assets/imgs/kanjiSearch-MvCyfFl0.png","width":1541,"height":792,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/snows/Documents/Program/js/bio/src/imgs/kanjiSearch.png";
							}
							if (target[name] !== undefined && globalThis.astroAsset) globalThis.astroAsset?.referencedImages.add("C:/Users/snows/Documents/Program/js/bio/src/imgs/kanjiSearch.png");
							return target[name];
						}
					});

const imageMidiFallingBar = new Proxy({"src":"/bio/assets/imgs/midiFallingBar-B4djXAuk.png","width":1448,"height":815,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/snows/Documents/Program/js/bio/src/imgs/midiFallingBar.png";
							}
							if (target[name] !== undefined && globalThis.astroAsset) globalThis.astroAsset?.referencedImages.add("C:/Users/snows/Documents/Program/js/bio/src/imgs/midiFallingBar.png");
							return target[name];
						}
					});

const imageTool2048 = new Proxy({"src":"/bio/assets/imgs/tool2048-CsWU_2ZT.png","width":1367,"height":769,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/snows/Documents/Program/js/bio/src/imgs/tool2048.png";
							}
							if (target[name] !== undefined && globalThis.astroAsset) globalThis.astroAsset?.referencedImages.add("C:/Users/snows/Documents/Program/js/bio/src/imgs/tool2048.png");
							return target[name];
						}
					});

const imageMandelbrot = new Proxy({"src":"/bio/assets/imgs/mandelbrot-CexUXTt_.png","width":1440,"height":810,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/snows/Documents/Program/js/bio/src/imgs/mandelbrot.png";
							}
							if (target[name] !== undefined && globalThis.astroAsset) globalThis.astroAsset?.referencedImages.add("C:/Users/snows/Documents/Program/js/bio/src/imgs/mandelbrot.png");
							return target[name];
						}
					});

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const worksData = [
  {
    id: "RepoShowcase",
    title: "RepoShowcase",
    description: "\u4F5C\u6210\u3057\u305F\u500B\u4EBA\u5229\u7528\u7528\u9014\u306E\u30E9\u30A4\u30D6\u30E9\u30EA\u4E00\u89A7\u3002",
    imageUrl: "",
    tags: ["Hub Page"],
    directLink: `https://hi2ma-bu4.github.io/RepoShowcase/`,
    githubLink: "https://github.com/hi2ma-bu4/RepoShowcase",
    longDescription: `\u4F5C\u6210\u3057\u305F\u30E9\u30A4\u30D6\u30E9\u30EA(\u307B\u3068\u3093\u3069\u500B\u4EBA\u5229\u7528\u7528\u9014)\u306E\u4E00\u89A7\u3068\u305D\u306E\u30C7\u30E2\u30DA\u30FC\u30B8\u3092\u8A2D\u7F6E\u3057\u3066\u3044\u307E\u3059\u3002`
  },
  {
    id: "KanjiSearch",
    title: "\u6F22\u5B57\u624B\u66F8\u304D\u691C\u7D22\u30C4\u30FC\u30EB",
    description: "\u30AA\u30D5\u30E9\u30A4\u30F3\u3067\u6F22\u5B57\u3092\u624B\u66F8\u304D\u691C\u7D22\u3067\u304D\u308B\u30C4\u30FC\u30EB\u3067\u3059\u3002",
    imageUrl: imageKanjiSearch,
    directLink: `${BASE_DIR}KanjiSearch/`,
    githubLink: "https://github.com/hi2ma-bu4/KanjiSearch",
    tags: ["JavaScript", "TypeScript", "WebAssembly", "Python", "ONNX-Runtime"],
    longDescription: `\u3053\u306E\u30C4\u30FC\u30EB\u306F\u3001\u30AA\u30D5\u30E9\u30A4\u30F3\u3067\u6F22\u5B57\u3092\u624B\u66F8\u304D\u691C\u7D22\u3067\u304D\u308B\u6A5F\u80FD\u3092\u63D0\u4F9B\u3057\u307E\u3059\u3002
(\u521D\u56DE\u8D77\u52D5\u6642\u306B\u30E2\u30C7\u30EB\u306E\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u304C\u5FC5\u8981\u3067\u3059)
\u624B\u66F8\u304D\u306E\u6F22\u5B57\u3092\u8A8D\u8B58\u3059\u308B\u305F\u3081\u306B\u3001ONNX\u5F62\u5F0F\u306E\u6A5F\u68B0\u5B66\u7FD2\u30E2\u30C7\u30EB\u3092\u4F7F\u7528\u3057\u3066\u3044\u307E\u3059\u3002
\u7CBE\u5EA6\u304C\u304B\u306A\u308A\u60AA\u3044\u305F\u3081\u3001\u3042\u307E\u308A\u5B9F\u7528\u7684\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u304C\u3001onnx\u306E\u52C9\u5F37\u3067\u4F5C\u6210\u3057\u307E\u3057\u305F\u3002`
  },
  {
    id: "MIDI-FallingBar",
    title: "MIDI FallingBar",
    description: "Midi\u3092Web\u3067YouTube\u3067\u898B\u308B\u3088\u3046\u306A\u5F62\u5F0F\u3067\u518D\u751F\u3067\u304D\u307E\u3059\u3002",
    imageUrl: imageMidiFallingBar,
    tags: ["JavaScript", "TypeScript", "GLSL", "Three.js", "Tone.js"],
    directLink: `${BASE_DIR}MIDI-FallingBar/`,
    githubLink: "https://github.com/hi2ma-bu4/MIDI-FallingBar",
    longDescription: `\u300CMidi\u3092\u30B0\u30E9\u30D5\u30A3\u30AB\u30EB\u306B\u518D\u751F\u3057\u305F\u3044\u300D\u3068\u3044\u3046\u7A81\u7136\u306E\u767A\u60F3\u306B\u3088\u308A\u3001\u751F\u307F\u51FA\u3055\u308C\u305F\u7523\u7269\u3067\u3059\u3002
\u3053\u308C\u306F\u3001\u73FE\u4EE3\u306E\u81EA\u52D5\u6F14\u594F\u30D4\u30A2\u30CE\u3084Synthesia\u30B9\u30BF\u30A4\u30EB\u306E\u52D5\u753B\u306B\u30A4\u30F3\u30B9\u30D1\u30A4\u30A2\u3055\u308C\u305F\u3001MIDI\u30CE\u30FC\u30C8\u30923D\u30D4\u30A2\u30CE\u30ED\u30FC\u30EB\u5F62\u5F0F\u306E\u300C\u843D\u4E0B\u3059\u308B\u30D0\u30FC\u300D\u3068\u3057\u3066\u8868\u793A\u3059\u308B\u30A6\u30A7\u30D6\u30D9\u30FC\u30B9\u306EMIDI\u30D3\u30B8\u30E5\u30A2\u30E9\u30A4\u30B6\u30FC\u3067\u3059\u3002
WebGL\u30EC\u30F3\u30C0\u30EA\u30F3\u30B0\u306B\u306FThree.js\u3092\u3001MIDI\u30D5\u30A1\u30A4\u30EB\u306E\u30D1\u30FC\u30B9\u306B\u306F@tonejs/midi\u3092\u4F7F\u7528\u3057\u3066\u3044\u307E\u3059\u3002`
  },
  {
    id: "tool-2048",
    title: "Tool 2048",
    description: "2048\u30B2\u30FC\u30E0\u306E\u6700\u9069\u89E3\u8A08\u7B97\u30C4\u30FC\u30EB\u3067\u3059\u3002",
    imageUrl: imageTool2048,
    directLink: `${BASE_DIR}tool-2048/`,
    githubLink: "https://github.com/hi2ma-bu4/tool-2048",
    tags: ["JavaScript", "TypeScript", "WebAssembly"],
    longDescription: `\u3053\u306E\u30C4\u30FC\u30EB\u306F\u3001\u30D1\u30BA\u30EB\u30B2\u30FC\u30E0\u300C2048\u300D\u306B\u304A\u3051\u308B\u6700\u9069\u89E3\u3092\u8A08\u7B97\u3059\u308B\u305F\u3081\u306B\u8A2D\u8A08\u3055\u308C\u3066\u3044\u307E\u3059\u3002
\u76E4\u9762\u306E\u72B6\u614B\u3092\u5206\u6790\u3057\u3001\u52B9\u7387\u7684\u306A\u624B\u9806\u3092\u63A2\u7D22\u3059\u308B\u3053\u3068\u3067\u3001
\u6700\u5C0F\u624B\u6570\u3067\u306E\u5230\u9054\u3084\u9AD8\u30B9\u30B3\u30A2\u6226\u7565\u306E\u691C\u8A3C\u306B\u6D3B\u7528\u3067\u304D\u307E\u3059\u3002`
  },
  {
    id: "ReTrans",
    title: "ReTrans",
    description: "\u518D\u7FFB\u8A33\u30D6\u30FC\u30E0\u306B\u4E57\u3063\u305F\u30DA\u30FC\u30B8\u3067\u3059\u3002",
    imageUrl: "",
    directLink: `${BASE_DIR}ReTrans/`,
    githubLink: "https://github.com/hi2ma-bu4/ReTrans",
    tags: ["JavaScript", "GAS"],
    longDescription: `\u5DF7\u3067\u5642\u306E\u300C\u518D\u7FFB\u8A33\u300D\u3067\u904A\u3079\u308B\u30DA\u30FC\u30B8\u3067\u3059\u3002

\u4EE5\u4E0B\u306EURL\u3067\u3001\u30AB\u30B9\u30BF\u30E0\u518D\u7FFB\u8A33\u304C\u8A66\u3059\u4E8B\u304C\u3067\u304D\u307E\u3059\u3002`,
    otherUrls: [`${BASE_DIR}ReTrans/?ja&en&gd&az&lo&ur&yo&ko&ar&is&gd&lb&ur&yi&vi&be&de&rw&sl&ny&zh-CN&ja`]
  },
  {
    id: "mandelbrot",
    title: "Mandelbrot Set",
    description: "\u30DE\u30F3\u30C7\u30EB\u30D6\u30ED\u96C6\u5408\u306E\u8868\u793A\u30DA\u30FC\u30B8\u3067\u3059\u3002",
    imageUrl: imageMandelbrot,
    directLink: `${BASE_DIR}mandelbrot/`,
    githubLink: "https://github.com/hi2ma-bu4/mandelbrot",
    tags: ["JavaScript", "GLSL", "PC Only"],
    longDescription: `\u3053\u306E\u30DA\u30FC\u30B8\u3067\u306F\u3001\u30DE\u30F3\u30C7\u30EB\u30D6\u30ED\u96C6\u5408\uFF08Mandelbrot Set\uFF09\u3092\u8996\u899A\u7684\u306B\u63A2\u7D22\u3067\u304D\u307E\u3059\u3002
\u8907\u96D1\u306A\u6570\u5024\u8A08\u7B97\u306B\u57FA\u3065\u304D\u3001\u7F8E\u3057\u3044\u30D5\u30E9\u30AF\u30BF\u30EB\u6A21\u69D8\u3092\u63CF\u753B\u3057\u3001
\u30BA\u30FC\u30E0\u3092\u901A\u3057\u3066\u3001\u6570\u5B66\u7684\u69CB\u9020\u306E\u7121\u9650\u306E\u5965\u884C\u304D\u3092\u4F53\u9A13\u3067\u304D\u307E\u3059\u3002

OpenGL Shading Language\u306E\u6570\u5024\u4E0A\u9650\u306B\u3088\u308A\u30BA\u30FC\u30E0\u9650\u754C\u304C\u6C7A\u307E\u3063\u3066\u3044\u307E\u3059\u3002`
  },
  {
    id: "js-ryoisyou",
    title: "Ryo is You",
    description: "Baba is You\u306E\u30D1\u30AF\u30EA\u3067\u3059\u3002",
    imageUrl: "",
    directLink: `${BASE_DIR}ryoisyou/`,
    githubLink: "https://github.com/hi2ma-bu4/ryoisyou",
    tags: ["JavaScript", "PC Only"],
    longDescription: `\u672C\u30DA\u30FC\u30B8\u306E\u5185\u5BB9\u306F\u300CBaba Is You\u300D\u306B\u7740\u60F3\u3092\u5F97\u3066\u69CB\u6210\u3055\u308C\u3066\u3044\u307E\u3059\u3002
\u3064\u307E\u308A\u30D1\u30AF\u30EA\u3068\u3044\u3046\u3053\u3068\u3067\u3059\u3002`
  },
  {
    id: "js-minecraft",
    title: "js-minecraft",
    description: "DOM\u3060\u3051\u3067Minecraft\u3092\u518D\u73FE\u3057\u305F\u304B\u3063\u305F...",
    imageUrl: "",
    directLink: `${BASE_DIR}js-minecraft/`,
    githubLink: "https://github.com/hi2ma-bu4/js-minecraft",
    tags: ["JavaScript", "PC Only"],
    longDescription: `DOM\u3060\u3051\u3067Minecraft\u3092\u518D\u73FE\u3057\u3066\u3044\u308B\u30DA\u30FC\u30B8\u304C\u3042\u308A\u3001
\u305D\u306E\u30DA\u30FC\u30B8\u30929\u5272\u771F\u4F3C\u3066\u4F5C\u6210\u3057\u305F\u3082\u306E\u3067\u3059\u3002`
  }
];
const $$Works = createComponent(($$result, $$props, $$slots) => {
  const workItemsMap = worksData.reduce(
    (acc, work) => {
      acc[work.id] = work;
      return acc;
    },
    {}
  );
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Works", "description": "JavaScript \u3092\u4E2D\u5FC3\u306B\u3001\u500B\u4EBA\u958B\u767A\u3057\u305F\u30DA\u30FC\u30B8\u30FB\u30B9\u30AF\u30EA\u30D7\u30C8\u3092\u63B2\u8F09\u3057\u3066\u3044\u307E\u3059\u3002\u5236\u4F5C\u7269\u4E00\u89A7\u3002" }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<h1 class="text-4xl md:text-5xl font-extrabold mb-10 text-center">Works</h1> <script>(function(){', '\n		window.WORK_ITEMS = items;\n	})();<\/script> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"> ', " </div> ", " ", " "])), maybeRenderHead(), defineScriptVars({ items: workItemsMap }), worksData.map((work) => renderTemplate`${renderComponent($$result2, "WorkCard", $$WorkCard, { ...work })}`), renderComponent($$result2, "WorkModal", $$WorkModal, {}), renderScript($$result2, "C:/Users/snows/Documents/Program/js/bio/src/pages/works.astro?astro&type=script&index=0&lang.ts")) })}`;
}, "C:/Users/snows/Documents/Program/js/bio/src/pages/works.astro", void 0);

const $$file = "C:/Users/snows/Documents/Program/js/bio/src/pages/works.astro";
const $$url = "/bio/works/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Works,
	file: $$file,
	url: $$url,
	worksData
}, Symbol.toStringTag, { value: 'Module' }));

export { _page as _, worksData as w };
