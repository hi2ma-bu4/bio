export {};

declare global {
	interface Window {
		__NEXT_SCROLL_BEHAVIOR__?: ScrollBehavior;
	}
}

function getScrollBehavior(): ScrollBehavior {
	return window.__NEXT_SCROLL_BEHAVIOR__ || "smooth";
}

function handleLinkClick(e: MouseEvent) {
	const link = (e.target as HTMLElement).closest("a");
	if (link && link.origin === window.location.origin) {
		const smooth = link.dataset.scrollSmooth;
		if (smooth === "false") {
			window.__NEXT_SCROLL_BEHAVIOR__ = "auto";
		} else if (smooth === "true") {
			window.__NEXT_SCROLL_BEHAVIOR__ = "smooth";
		}
		// 指定がない場合は undefined のまま（前回値を引き継がないように scrollToHash でリセットする）
	}
}

function scrollToHash() {
	const hash = window.location.hash;
	if (!hash) {
		// ハッシュがない場合もリセットしておく
		window.__NEXT_SCROLL_BEHAVIOR__ = undefined;
		return;
	}

	const id = decodeURIComponent(hash.substring(1));
	const target = document.getElementById(id);

	if (target) {
		const behavior = getScrollBehavior();
		setTimeout(() => {
			target.scrollIntoView({ behavior });
			// スクロール完了後にリセット
			window.__NEXT_SCROLL_BEHAVIOR__ = undefined;
		}, 200);
	} else {
		// ターゲットが見つからない場合もリセット
		window.__NEXT_SCROLL_BEHAVIOR__ = undefined;
	}
}

document.addEventListener("click", handleLinkClick);
document.addEventListener("astro:after-swap", scrollToHash);
