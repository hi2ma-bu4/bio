import { B as BASE_DIR } from './Header-Bnk7kFAb.js';

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

const worksData = [
  {
    id: "RepoShowcase",
    title: "RepoShowcase",
    description: "作成した個人利用用途のライブラリ一覧。",
    imageUrl: "",
    tags: ["Hub Page"],
    directLink: `https://hi2ma-bu4.github.io/RepoShowcase/`,
    githubLink: "https://github.com/hi2ma-bu4/RepoShowcase",
    longDescription: `作成したライブラリ(ほとんど個人利用用途)の一覧とそのデモページを設置しています。`
  },
  {
    id: "KanjiSearch",
    title: "漢字手書き検索ツール",
    description: "オフラインで漢字を手書き検索できるツールです。",
    imageUrl: imageKanjiSearch,
    directLink: `${BASE_DIR}KanjiSearch/`,
    githubLink: "https://github.com/hi2ma-bu4/KanjiSearch",
    tags: ["JavaScript", "TypeScript", "WebAssembly", "Python", "ONNX-Runtime"],
    longDescription: `このツールは、オフラインで漢字を手書き検索できる機能を提供します。
(初回起動時にモデルのダウンロードが必要です)
手書きの漢字を認識するために、ONNX形式の機械学習モデルを使用しています。
精度がかなり悪いため、あまり実用的ではありませんが、onnxの勉強で作成しました。`
  },
  {
    id: "MIDI-FallingBar",
    title: "MIDI FallingBar",
    description: "MidiをWebでYouTubeで見るような形式で再生できます。",
    imageUrl: imageMidiFallingBar,
    tags: ["JavaScript", "TypeScript", "GLSL", "Three.js", "Tone.js"],
    directLink: `${BASE_DIR}MIDI-FallingBar/`,
    githubLink: "https://github.com/hi2ma-bu4/MIDI-FallingBar",
    longDescription: `「Midiをグラフィカルに再生したい」という突然の発想により、生み出された産物です。
これは、現代の自動演奏ピアノやSynthesiaスタイルの動画にインスパイアされた、MIDIノートを3Dピアノロール形式の「落下するバー」として表示するウェブベースのMIDIビジュアライザーです。
WebGLレンダリングにはThree.jsを、MIDIファイルのパースには@tonejs/midiを使用しています。`
  },
  {
    id: "tool-2048",
    title: "Tool 2048",
    description: "2048ゲームの最適解計算ツールです。",
    imageUrl: imageTool2048,
    directLink: `${BASE_DIR}tool-2048/`,
    githubLink: "https://github.com/hi2ma-bu4/tool-2048",
    tags: ["JavaScript", "TypeScript", "WebAssembly"],
    longDescription: `このツールは、パズルゲーム「2048」における最適解を計算するために設計されています。
盤面の状態を分析し、効率的な手順を探索することで、
最小手数での到達や高スコア戦略の検証に活用できます。`
  },
  {
    id: "ReTrans",
    title: "ReTrans",
    description: "再翻訳ブームに乗ったページです。",
    imageUrl: "",
    directLink: `${BASE_DIR}ReTrans/`,
    githubLink: "https://github.com/hi2ma-bu4/ReTrans",
    tags: ["JavaScript", "GAS"],
    longDescription: `巷で噂の「再翻訳」で遊べるページです。

以下のURLで、カスタム再翻訳が試す事ができます。`,
    otherUrls: [`${BASE_DIR}ReTrans/?ja&en&gd&az&lo&ur&yo&ko&ar&is&gd&lb&ur&yi&vi&be&de&rw&sl&ny&zh-CN&ja`]
  },
  {
    id: "mandelbrot",
    title: "Mandelbrot Set",
    description: "マンデルブロ集合の表示ページです。",
    imageUrl: imageMandelbrot,
    directLink: `${BASE_DIR}mandelbrot/`,
    githubLink: "https://github.com/hi2ma-bu4/mandelbrot",
    tags: ["JavaScript", "GLSL", "PC Only"],
    longDescription: `このページでは、マンデルブロ集合（Mandelbrot Set）を視覚的に探索できます。
複雑な数値計算に基づき、美しいフラクタル模様を描画し、
ズームを通して、数学的構造の無限の奥行きを体験できます。

OpenGL Shading Language의数値上限によりズーム限界が決まっています。`
  },
  {
    id: "js-ryoisyou",
    title: "Ryo is You",
    description: "Baba is Youのパクリです。",
    imageUrl: "",
    directLink: `${BASE_DIR}ryoisyou/`,
    githubLink: "https://github.com/hi2ma-bu4/ryoisyou",
    tags: ["JavaScript", "PC Only"],
    longDescription: `本ページの内容は「Baba Is You」に着想を得て構成されています。
つまりパクリということです。`
  },
  {
    id: "js-minecraft",
    title: "js-minecraft",
    description: "DOMだけでMinecraftを再現したかった...",
    imageUrl: "",
    directLink: `${BASE_DIR}js-minecraft/`,
    githubLink: "https://github.com/hi2ma-bu4/js-minecraft",
    tags: ["JavaScript", "PC Only"],
    longDescription: `DOMだけでMinecraftを再現しているページがあり、
そのページを9割真似て作成したものです。`
  }
];
const workItemsMap = worksData.reduce(
  (acc, work) => {
    acc[work.id] = work;
    return acc;
  },
  {}
);

export { workItemsMap as a, worksData as w };
//# sourceMappingURL=works-B3H3rTV4.js.map
