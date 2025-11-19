// フローティングヘッダーのスクロール制御

let lastScrollFunction: () => void;
function initHeaderScroll() {
	const mainHeader = document.getElementById("main-header");
	const floatingHeader = document.getElementById("floating-header");

	// 要素が見つからない場合は処理を中断
	if (!mainHeader || !floatingHeader) {
		console.warn("Header elements not found for scroll script.");
		return;
	}

	let lastScrollY = window.scrollY;
	const mainHeaderHeight = mainHeader.offsetHeight;

	if (lastScrollFunction) {
		window.removeEventListener("scroll", lastScrollFunction);
	}
	lastScrollFunction = () => {
		const scrollY = window.scrollY;

		if (scrollY > mainHeaderHeight) {
			// メインヘッダーが画面外
			if (scrollY < lastScrollY) {
				// スクロールアップ時
				floatingHeader.classList.remove("-translate-y-full");
			} else {
				// スクロールダウン時
				floatingHeader.classList.add("-translate-y-full");
			}
		} else {
			// 画面上部では常に非表示
			floatingHeader.classList.add("-translate-y-full");
		}

		lastScrollY = scrollY < 0 ? 0 : scrollY;
	};

	window.addEventListener("scroll", lastScrollFunction, { passive: true });
}

// DOMの読み込み完了を待ってから実行
document.addEventListener("astro:after-swap", initHeaderScroll);
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initHeaderScroll);
} else {
	initHeaderScroll();
}
