let observer: MutationObserver | null = null;
let loadedImages = new Map<HTMLImageElement, EventListener>();
const originalBgMap = new WeakMap<HTMLElement, string | null>();
const colorCache = new Map<string, [number, number, number]>();

import retro8bitStyles from "./retro8bit.css?inline";

let colorCanvas: HTMLCanvasElement | null = null;
let colorCtx: CanvasRenderingContext2D | null = null;

const DIFF_THRESHOLD = 25;

function captureOriginalBackground(el: HTMLElement): void {
	if (originalBgMap.has(el)) return;

	let cur: HTMLElement | null = el;
	while (cur) {
		const bg = getComputedStyle(cur).backgroundColor;
		if (bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
			originalBgMap.set(el, bg);
			return;
		}
		cur = cur.parentElement;
	}
	originalBgMap.set(el, null);
}

function getOriginalBg(el: HTMLElement | null): string | null {
	return el ? (originalBgMap.get(el) ?? null) : null;
}

function parseComputedRGB(color: string): [number, number, number] | null {
	const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
	if (!m) return null;
	return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
	const dr = a[0] - b[0];
	const dg = a[1] - b[1];
	const db = a[2] - b[2];
	return Math.sqrt(dr * dr + dg * dg + db * db);
}

function normalizeToRGB(color: string): [number, number, number] | null {
	const cached = colorCache.get(color);
	if (cached) return cached;

	if (!colorCtx) return null;

	colorCtx.clearRect(0, 0, 1, 1);
	colorCtx.fillStyle = "#000";
	colorCtx.fillStyle = color;
	colorCtx.fillRect(0, 0, 1, 1);

	const d = colorCtx.getImageData(0, 0, 1, 1).data;
	const rgb: [number, number, number] = [d[0], d[1], d[2]];

	colorCache.set(color, rgb);
	return rgb;
}

function isColorDifferent(a: string, b: string): boolean {
	const ra = normalizeToRGB(a);
	const rb = normalizeToRGB(b);
	if (!ra || !rb) return false;

	const dr = ra[0] - rb[0];
	const dg = ra[1] - rb[1];
	const db = ra[2] - rb[2];

	return dr * dr + dg * dg + db * db >= DIFF_THRESHOLD * DIFF_THRESHOLD;
}

export function startRetro8bit(): void {
	const DOT_SIZE = 4;
	const EXCLUDE_CLASS = "no-retro";
	const BG_COLOR = "#000000";
	const MAIN_COLOR = "#00FF00";
	const SUB_COLOR = "#008000";

	colorCanvas = document.createElement("canvas");
	colorCanvas.width = colorCanvas.height = 1;

	colorCtx = colorCanvas.getContext("2d", { willReadFrequently: true });

	// --- スタイル ---
	let style = document.getElementById("retro8bit-style") as HTMLStyleElement | null;
	if (!style) {
		style = document.createElement("style");
		style.id = "retro8bit-style";
		style.textContent = retro8bitStyles;
		document.head.appendChild(style);

		document.body.style.setProperty("--retro-bg-color", BG_COLOR);
		document.body.style.setProperty("--retro-main-color", MAIN_COLOR);
		document.body.style.setProperty("--retro-sub-color", SUB_COLOR);
	}

	function retroizeElement(el: HTMLElement): void {
		if (el.classList.contains(EXCLUDE_CLASS)) return;

		captureOriginalBackground(el);
		if (el.parentElement) captureOriginalBackground(el.parentElement);

		const childBg = getOriginalBg(el);
		const parentBg = getOriginalBg(el.parentElement);

		let needsBorder = false;
		if (childBg && parentBg && isColorDifferent(childBg, parentBg)) {
			needsBorder = true;
		}

		const computed = window.getComputedStyle(el);
		if (computed.borderStyle !== "none" && computed.borderWidth !== "0px") el.style.borderColor = MAIN_COLOR;
		if (computed.backgroundColor !== "rgba(0, 0, 0, 0)" && computed.backgroundColor !== "transparent") el.style.backgroundColor = BG_COLOR;

		if (needsBorder) {
			el.style.border = `1px solid ${MAIN_COLOR}`;
			el.style.boxSizing = "border-box";
		}
	}

	function retroizeImage(img: HTMLImageElement): void {
		if (img.classList.contains(EXCLUDE_CLASS)) return;

		const processImage = async (): Promise<void> => {
			if (!img.parentNode || img.naturalWidth === 0 || img.naturalHeight === 0) return;
			await img.decode();

			const targetWidth = Math.max(1, Math.floor(img.width / DOT_SIZE));
			const targetHeight = Math.max(1, Math.floor(img.height / DOT_SIZE));

			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			canvas.width = targetWidth;
			canvas.height = targetHeight;
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
			canvas.style.width = img.width + "px";
			canvas.style.height = img.height + "px";

			Array.from(img.attributes).forEach((attr) => canvas.setAttribute(attr.name, attr.value));

			// picture要素内のimgの場合、親Nodeはpictureであるため、さらにその親Nodeを取得して置換する
			if (img.parentNode.nodeName.toLowerCase() === "picture" && img.parentNode.parentNode) {
				img.parentNode.parentNode.replaceChild(canvas, img.parentNode);
			} else {
				img.parentNode.replaceChild(canvas, img);
			}

			const tmpCanvas = document.createElement("canvas");
			tmpCanvas.width = canvas.width;
			tmpCanvas.height = canvas.height;
			const tmpCtx = tmpCanvas.getContext("2d");
			if (!tmpCtx) return;
			tmpCtx.drawImage(canvas, 0, 0, tmpCanvas.width, tmpCanvas.height);
			ctx.drawImage(tmpCanvas, 0, 0, canvas.width, canvas.height);

			loadedImages.delete(img); // 処理完了したのでイベント参照削除
		};

		if (img.complete) {
			processImage();
		} else {
			const listener = () => processImage();
			img.addEventListener("load", listener);
			loadedImages.set(img, listener);
		}
	}

	// 初期適用
	document.querySelectorAll<HTMLElement>("body *").forEach((el) => retroizeElement(el));
	document.querySelectorAll<HTMLImageElement>("img").forEach((img) => retroizeImage(img));

	// 動的追加対応
	observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (!(node instanceof HTMLElement)) return;
				captureOriginalBackground(node);
				retroizeElement(node);
				if (node instanceof HTMLImageElement) retroizeImage(node);
				node.querySelectorAll<HTMLElement>("*").forEach((child) => {
					captureOriginalBackground(node);
					retroizeElement(child);
					if (child instanceof HTMLImageElement) retroizeImage(child);
				});
			});
		});
	});

	observer.observe(document.body, { childList: true, subtree: true });
}

// --- 破棄関数 ---
export function destroyRetro8bit(): void {
	// MutationObserver停止
	if (observer) {
		observer.disconnect();
		observer = null;
	}
	colorCanvas = colorCtx = null;

	// 未ロード画像イベント解除
	loadedImages.forEach((listener, img) => {
		img.removeEventListener("load", listener);
	});
	loadedImages.clear();
}
