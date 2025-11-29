import { addEscapeListener, createFocusTrap, getFocusable, isActivationKey, isEnterKey, lockBodyScroll, unlockBodyScroll } from "./ui-utils";

function initMobileMenu() {
	const checkbox = document.getElementById("mobile-menu-toggle") as HTMLInputElement | null;
	if (!checkbox) return;

	// ハンバーガーのラベル（<label for="mobile-menu-toggle">）をキーボード操作可能にする
	const toggleLabel = document.querySelector<HTMLLabelElement>('label[for="mobile-menu-toggle"]') as HTMLElement | null;

	const syncToggleAria = () => {
		if (toggleLabel) toggleLabel.setAttribute("aria-pressed", String(checkbox!.checked));
		const navEl = document.getElementById("mobile-nav");
		if (navEl) navEl.setAttribute("aria-hidden", String(!checkbox!.checked));
	};

	if (toggleLabel) {
		if (!toggleLabel.hasAttribute("tabindex")) toggleLabel.setAttribute("tabindex", "0");
		toggleLabel.setAttribute("role", "button");
		// 初期状態はチェックが外れている想定
		toggleLabel.setAttribute("aria-pressed", String(checkbox.checked));
		// aria-controls を追加してメニューを関連付け
		toggleLabel.setAttribute("aria-controls", "mobile-nav");

		// ラベルで Enter / Space を押したときにトグルする
		toggleLabel.addEventListener("keydown", (ev: KeyboardEvent) => {
			if (isActivationKey(ev)) {
				ev.preventDefault();
				checkbox!.checked = !checkbox!.checked;
				updateMenuFocus();
				syncToggleAria();
			}
		});
	}

	const closeButton = document.getElementById("mobile-menu-close-button") as HTMLButtonElement | null;
	if (closeButton) {
		closeButton.addEventListener("click", () => {
			closeMobileMenu();
		});
	}

	let focusTrap: ReturnType<typeof createFocusTrap> | null = null;
	let removeEscape: (() => void) | null = null;

	function closeMobileMenu() {
		if (checkbox && checkbox.checked) {
			const el = document.activeElement;
			if (el instanceof HTMLElement) {
				el.blur();
			}

			checkbox.checked = false;
			updateMenuFocus();
			// メニューを閉じたらトグルにフォーカスを戻す
			try {
				checkbox.focus();
				// aria を同期
				syncToggleAria();
			} catch (e) {
				/* ignore */
			}
		}
	}

	function attachLinkHandlers() {
		// mobile メニュー内のリンクがクリックされたらメニューを閉じる
		const links = document.querySelectorAll<HTMLAnchorElement>("#mobile-menu-toggle ~ nav a");
		links.forEach((el) => el.addEventListener("click", closeMobileMenu));
	}

	// 非表示時にメニュー内のフォーカス可能要素をタブ順から除外する
	function updateMenuFocus() {
		const nav = document.querySelector<HTMLElement>("#mobile-menu-toggle ~ nav");
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

	// チェックボックスにフォーカス時に Enter でトグル（Space は既定でトグル）
	checkbox.addEventListener("keydown", (ev: KeyboardEvent) => {
		if (isEnterKey(ev)) {
			ev.preventDefault();
			checkbox.checked = !checkbox.checked;
			updateMenuFocus();
			syncToggleAria();
		}
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initMobileMenu);
} else {
	initMobileMenu();
}
