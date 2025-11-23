function initMobileMenu() {
	const checkbox = document.getElementById("mobile-menu-toggle") as HTMLInputElement | null;
	if (!checkbox) return;

	function closeMobileMenu() {
		if (checkbox && checkbox.checked) {
			checkbox.checked = false;
		}
	}

	function attachLinkHandlers() {
		// mobile メニュー内のリンクがクリックされたらメニューを閉じる
		const links = document.querySelectorAll("#mobile-menu-toggle ~ nav a");
		links.forEach((el) => el.addEventListener("click", closeMobileMenu));
	}

	// 非表示時にメニュー内のフォーカス可能要素をタブ順から除外する
	function getFocusable(el: Element) {
		return Array.from(el.querySelectorAll<HTMLElement>("a,button,input,textarea,select,[tabindex]")).filter((e) => !e.hasAttribute("disabled"));
	}

	function updateMenuFocus() {
		const nav = document.querySelector("#mobile-menu-toggle ~ nav") as HTMLElement | null;
		const overlay = document.querySelector("#mobile-menu-toggle ~ label[for='mobile-menu-toggle']") as HTMLElement | null;
		const isOpen = checkbox!.checked;

		if (nav) {
			nav.setAttribute("aria-hidden", String(!isOpen));
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
		}

		if (overlay) {
			overlay.setAttribute("aria-hidden", String(!isOpen));
			// overlay は通常フォーカスされないが念のため tabindex 管理
			const focusables = getFocusable(overlay);
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
