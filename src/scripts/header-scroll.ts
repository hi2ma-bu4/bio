import { getFocusable } from "./libs/ui-utils";

let lastScrollFunction: () => void;
function initHeaderScroll() {
	const mainHeader = document.getElementById("main-header");
	const floatingHeader = document.getElementById("floating-header");

	// 要素が見つからない場合は処理を中断
	if (!mainHeader || !floatingHeader) {
		console.warn("Header elements not found for scroll script.");
		return;
	}

	const mobileMenuToggle = document.getElementById("mobile-menu-toggle") as HTMLInputElement | null;
	const mobileNav = mobileMenuToggle?.nextElementSibling?.nextElementSibling as HTMLElement | null;

	if (mobileMenuToggle && mobileNav) {
		const observer = new MutationObserver(() => {
			const isHidden = mobileNav.classList.contains("translate-x-full");
			mobileNav.setAttribute("aria-hidden", isHidden.toString());
		});

		observer.observe(mobileNav, { attributes: true, attributeFilter: ["class"] });

		// 初期状態を設定
		const isHidden = mobileNav.classList.contains("translate-x-full");
		mobileNav.setAttribute("aria-hidden", isHidden.toString());
	}

	let lastScrollY = window.scrollY;
	const mainHeaderHeight = mainHeader.offsetHeight;

	// 初期の focus 管理状態を反映（現在のクラス/表示状態から判定して渡す）
	const initialHiddenByClass = (floatingHeader as HTMLElement).classList.contains("-translate-y-full");
	const initialComputedHidden = getComputedStyle(floatingHeader as HTMLElement).display === "none" || (floatingHeader as HTMLElement).hidden;
	let prevIsHidden = initialHiddenByClass || initialComputedHidden;
	updateFloatingHeaderFocus(prevIsHidden);

	// 表示状態を外部で判定して渡す（衝突を避ける）
	function updateFloatingHeaderFocus(isHidden: boolean) {
		const fh = floatingHeader as HTMLElement;
		fh.setAttribute("aria-hidden", String(isHidden));

		const focusables = getFocusable(fh);
		focusables.forEach((el) => {
			if (isHidden) {
				if (el.hasAttribute("tabindex")) el.dataset._savedTab = el.getAttribute("tabindex") || "";
				else el.dataset._savedTab = "";
				el.setAttribute("tabindex", "-1");
			} else {
				if (el.dataset._savedTab === "") el.removeAttribute("tabindex");
				else if (el.dataset._savedTab != null) el.setAttribute("tabindex", el.dataset._savedTab);
				delete el.dataset._savedTab;
			}
		});
	}

	if (lastScrollFunction) {
		window.removeEventListener("scroll", lastScrollFunction);
	}
	lastScrollFunction = () => {
		const scrollY = window.scrollY;

		let newIsHidden: boolean;
		if (scrollY > mainHeaderHeight) {
			// メインヘッダーが画面外
			if (scrollY < lastScrollY) {
				// スクロールアップ時
				floatingHeader.classList.remove("-translate-y-full");
				newIsHidden = false;
			} else {
				// スクロールダウン時
				floatingHeader.classList.add("-translate-y-full");
				newIsHidden = true;
			}
		} else {
			// 画面上部では常に非表示
			floatingHeader.classList.add("-translate-y-full");
			newIsHidden = true;
		}

		// 状態が変化した場合のみ focus 管理を実行
		if (newIsHidden !== prevIsHidden) {
			updateFloatingHeaderFocus(newIsHidden);
			prevIsHidden = newIsHidden;
		}

		lastScrollY = scrollY < 0 ? 0 : scrollY;
	};

	window.addEventListener("scroll", lastScrollFunction, { passive: true });
}

function init() {
	initHeaderScroll();
	if (Math.random() < 0.01) {
		const logos = document.querySelectorAll<HTMLAnchorElement>("#logo,#floating-logo");
		for (const logo of Array.from(logos)) {
			logo.style.transform = "rotateY(180deg)";
		}
	}
}

// DOMの読み込み完了を待ってから実行
document.addEventListener("astro:after-swap", initHeaderScroll);
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
