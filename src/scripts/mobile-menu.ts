import { addEscapeListener, createFocusTrap, getFocusable, lockBodyScroll, unlockBodyScroll } from "./ui-utils";

function initMobileMenu() {
	const checkbox = document.getElementById("mobile-menu-toggle") as HTMLInputElement | null;
	if (!checkbox) return;

	let focusTrap: ReturnType<typeof createFocusTrap> | null = null;
	let removeEscape: (() => void) | null = null;

	function closeMobileMenu() {
		if (checkbox && checkbox.checked) {
			checkbox.checked = false;
			updateMenuFocus();
			// メニューを閉じたらトグルにフォーカスを戻す
			try {
				checkbox.focus();
			} catch (e) {
				/* ignore */
			}
		}
	}

	function attachLinkHandlers() {
		// mobile メニュー内のリンクがクリックされたらメニューを閉じる
		const links = document.querySelectorAll("#mobile-menu-toggle ~ nav a");
		links.forEach((el) => el.addEventListener("click", closeMobileMenu));
	}

	// 非表示時にメニュー内のフォーカス可能要素をタブ順から除外する
	function updateMenuFocus() {
		const nav = document.querySelector("#mobile-menu-toggle ~ nav") as HTMLElement | null;
		const isOpen = checkbox!.checked;

		if (nav) {
			nav.ariaHidden = String(!isOpen);
			const focusables = getFocusable(nav);
			focusables.forEach((el) => {
				if (!isOpen) {
					if (el.hasAttribute("tabindex")) el.dataset._savedTab = el.getAttribute("tabindex") || "";
					else el.dataset._savedTab = "";
					el.setAttribute("tabindex", "-1");
				} else {
					if (el.dataset._savedTab === "") el.removeAttribute("tabindex");
					else if (el.dataset._savedTab != null) el.setAttribute("tabindex", el.dataset._savedTab);
					delete el.dataset._savedTab;
				}
			});

			if (isOpen) {
				lockBodyScroll();
				focusTrap = createFocusTrap(nav);
				focusTrap.activate();
				if (!removeEscape) removeEscape = addEscapeListener(closeMobileMenu);
			} else {
				if (focusTrap) {
					focusTrap.deactivate();
					focusTrap = null;
				}
				if (removeEscape) {
					removeEscape();
					removeEscape = null;
				}
				unlockBodyScroll();
			}
		}
	}

	attachLinkHandlers();
	updateMenuFocus();

	// Astro のクライアント遷移後にもメニューを閉じる
	window.addEventListener("astro:after-swap", closeMobileMenu);

	// チェックボックスの変更で表示状態を反映
	checkbox.addEventListener("change", updateMenuFocus);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initMobileMenu);
} else {
	initMobileMenu();
}
