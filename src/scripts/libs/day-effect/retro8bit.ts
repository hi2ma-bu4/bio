let observer: MutationObserver | null = null;
let loadedImages = new Map<HTMLImageElement, EventListener>();

export function startRetro8bit(): void {
	const DOT_SIZE = 4;
	const EXCLUDE_CLASS = "no-retro";

	// --- スタイル ---
	let style = document.getElementById("retro8bit-style") as HTMLStyleElement | null;
	if (!style) {
		style = document.createElement("style");
		style.id = "retro8bit-style";
		style.innerHTML = `
            body {
                background-color: #000000 !important;
            }
            body, body *:not(.${EXCLUDE_CLASS}) {
                font-family: 'EnkaDotGothic24', 'Courier New', Courier, 'ＭＳ ゴシック', 'MS UI Gothic	', monospace !important;
                color: #00FF00 !important;
                text-shadow:
                    1px 1px #008000,
                    -1px -1px #008000,
                    1px -1px #008000,
                    -1px 1px #008000 !important;
            }
        `;
		document.head.appendChild(style);
	}

	function retroizeElement(el: HTMLElement): void {
		if (el.classList.contains(EXCLUDE_CLASS)) return;
		const computed = window.getComputedStyle(el);
		if (computed.borderStyle !== "none" && computed.borderWidth !== "0px") el.style.borderColor = "#00FF00";
		if (computed.backgroundColor !== "rgba(0, 0, 0, 0)" && computed.backgroundColor !== "transparent") el.style.backgroundColor = "#000000";
	}

	function retroizeImage(img: HTMLImageElement): void {
		if (img.classList.contains(EXCLUDE_CLASS)) return;

		const processImage = (): void => {
			if (!img.parentNode || img.naturalWidth === 0 || img.naturalHeight === 0) return;

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

			img.parentNode.replaceChild(canvas, img);

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
				retroizeElement(node);
				if (node instanceof HTMLImageElement) retroizeImage(node);
				node.querySelectorAll<HTMLElement>("*").forEach((child) => {
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

	// 未ロード画像イベント解除
	loadedImages.forEach((listener, img) => {
		img.removeEventListener("load", listener);
	});
	loadedImages.clear();
}
