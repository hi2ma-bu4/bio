import { applyTheme, getNextTheme, safeGet, safeSet, updateAllToggleButtonsUI, updateTheme, updateToggleButtonUI } from "./libs/theme-utils";

/**
 * テーマ切り替えボタンにイベントをバインドする
 */
function bindThemeUI() {
	const checkThemeBtnClass = "theme-toggle-check";
	const toggleButtons = document.querySelectorAll<HTMLButtonElement>(`.theme-toggle:not(.${checkThemeBtnClass})`);
	for (const toggleButton of toggleButtons) {
		toggleButton.classList.add(checkThemeBtnClass);

		updateToggleButtonUI(toggleButton);

		toggleButton.addEventListener("click", () => {
			const current = safeGet() ?? "auto";
			const next = getNextTheme(current);

			safeSet(next);
			applyTheme(next);

			updateAllToggleButtonsUI();
		});
	}

	// バインド後にすべてのトグルボタン間で表示状態が同期されていることを確認
	updateAllToggleButtonsUI();
}

let _mqListenerAdded = false;
/**
 * システムのテーマ設定変更を監視するリスナーを登録する
 */
function ensureSystemListener() {
	if (_mqListenerAdded) return;
	_mqListenerAdded = true;

	const mq = window.matchMedia("(prefers-color-scheme: dark)");
	const onChange = () => {
		if ((safeGet() ?? "auto") === "auto") {
			applyTheme("auto");
			updateAllToggleButtonsUI();
		}
	};
	if (mq.addEventListener) mq.addEventListener("change", onChange);
	else mq.addListener(onChange);
}

/**
 * テーマUIの初期化処理を行う
 */
function initThemeUI() {
	updateTheme();
	bindThemeUI();
	ensureSystemListener();
}

document.addEventListener("DOMContentLoaded", initThemeUI);
document.addEventListener("astro:after-swap", initThemeUI);

if (document.readyState !== "loading") {
	initThemeUI();
}

updateTheme();
