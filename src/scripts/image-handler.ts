import { BASE_DIR, CLASS_AUTO_IMG_ALT } from "../config";

const ErrorImageUrl = `${BASE_DIR}no-image.svg`;
const isCheckClassName = "bio-imgCheck";
const isLoadClassName = "bio-imgLoad";
const isErrClassName = "bio-imgLoadErr";
const imgWrapperClassName = "img-wrapper";
const altButtonClassName = "alt-button";
const altPopupClassName = "alt-popup";

let imgIndex = 0;

/**
 * 画像をラップし、alt テキストを表示するためのボタンを追加します。
 * @param img ラップする画像要素。
 */
function wrapWithAltButton(img: HTMLImageElement): void {
	const id = `uid-img-${imgIndex}`;
	imgIndex++;

	// ラッパー要素を作成
	const wrapper = document.createElement("div");
	wrapper.className = imgWrapperClassName;

	// 画像をラッパーで置き換え、画像をラッパー内に追加
	img.parentNode?.insertBefore(wrapper, img);
	wrapper.appendChild(img);
	img.setAttribute("aria-labelledby", id);

	// alt ボタンを追加
	const button = document.createElement("input");
	button.type = "button";
	button.className = altButtonClassName;
	button.value = "alt";
	wrapper.appendChild(button);

	const altText = img.alt;
	button.addEventListener("click", () => {
		const oldPopup = wrapper.querySelector<HTMLDivElement>(`.${altPopupClassName}`);
		if (oldPopup) {
			oldPopup.remove();
			return;
		}
		const popup = document.createElement("div");
		popup.className = altPopupClassName;
		popup.innerText = altText;
		popup.id = id;

		wrapper.appendChild(popup);
	});
}

/**
 * 画像の読み込み成功時の処理を行います。
 * @param target 読み込まれた画像要素。
 */
function handleLoad(target: HTMLImageElement): void {
	if (target.classList.contains(isLoadClassName) || target.classList.contains(isErrClassName)) return;
	target.classList.add(isLoadClassName);
}

/**
 * 画像の読み込みエラー時の処理を行います。
 * @param target 読み込みに失敗した画像要素。
 */
function handleError(target: HTMLImageElement): void {
	// 無限ループを防止
	if (target.classList.contains(isErrClassName)) return;

	target.classList.add(isErrClassName);
	console.warn(`image load error: `, target.src);

	// 文脈のために元のソースを含むように alt テキストを更新
	target.alt = `${target.alt ?? "説明なし"}(${target.src})`;
	target.src = ErrorImageUrl;

	if (target.classList.contains(CLASS_AUTO_IMG_ALT)) {
		wrapWithAltButton(target);
	}
}

// すべての読み込み/エラーイベントを捕捉するために、ドキュメントでイベントデリゲーションを使用します
document.addEventListener(
	"load",
	(e) => {
		if (e.target instanceof HTMLImageElement) {
			handleLoad(e.target);
		}
	},
	true,
); // キャプチャフェーズを使用

document.addEventListener(
	"error",
	(e) => {
		if (e.target instanceof HTMLImageElement) {
			handleError(e.target);
		}
	},
	true,
); // キャプチャフェーズを使用

/**
 * まだ処理されていない場合、画像に「チェック中」クラスを適用します。
 * キャッシュされた画像も処理します。
 * @param img 処理する画像要素。
 */
function processImage(img: HTMLImageElement): void {
	if (img.classList.contains(isCheckClassName) || img.classList.contains(isLoadClassName) || img.classList.contains(isErrClassName)) {
		return;
	}
	img.classList.add(isCheckClassName);

	// キャッシュされた画像の場合、'load' または 'error' イベントがすでに発生している可能性があります。
	// `complete` プロパティを確認する必要があります。
	if (img.complete) {
		if (img.naturalWidth === 0) {
			// これはエラーの可能性が高い
			handleError(img);
		} else {
			// これは読み込み成功の可能性が高い
			handleLoad(img);
		}
	}
}

/**
 * 指定された NodeList 内のすべての画像を検索して処理します。
 * @param nodes 画像を検索するノードのリスト。
 */
function checkNodesForImages(nodes: NodeList): void {
	for (const node of nodes) {
		if (node.nodeType === Node.ELEMENT_NODE) {
			const el = node as Element;
			// ノード自体が画像の場合
			if (el.tagName === "IMG") {
				processImage(el as HTMLImageElement);
			}
			// ノード内の画像をチェック
			const imgs = el.querySelectorAll<HTMLImageElement>("img");
			imgs.forEach(processImage);
		}
	}
}

/**
 * 画像処理を初期化し、MutationObserver を設定します。
 */
function initImageHandler(): void {
	// ページ上のすべての画像に対する初期チェック
	document.querySelectorAll<HTMLImageElement>("img").forEach(processImage);

	// 動的に追加された画像を検出するために MutationObserver を使用
	const observer = new MutationObserver((mutationsList) => {
		for (const mutation of mutationsList) {
			if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
				checkNodesForImages(mutation.addedNodes);
			}
		}
	});

	// ドキュメントボディの変更の監視を開始
	observer.observe(document.body, { childList: true, subtree: true });
}

// 初期化を実行
initImageHandler();

// Astro のビュー遷移後にチェックを再実行
document.addEventListener("astro:after-swap", () => {
	initImageHandler();
});
