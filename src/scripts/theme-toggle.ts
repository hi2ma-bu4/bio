const STORAGE_KEY = "theme";

function safeGet() {
	return typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
}
function safeSet(v: string) {
	if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, v);
}

function applyTheme(mode: string, doc: Document = document) {
	const setDark = () => doc.documentElement.classList.add("dark");
	const setLight = () => doc.documentElement.classList.remove("dark");

	// 他のコンポーネントが現在の状態をクエリできるように属性を追加
	doc.documentElement.dataset.theme = mode;

	if (mode === "light") setLight();
	else if (mode === "dark") setDark();
	else {
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) setDark();
		else setLight();
	}
}

// テーマ変更
function updateTheme() {
	applyTheme(safeGet() ?? "auto");
}

// バインド UI 要素
function bindThemeUI() {
	const checkThemeBtnClass = "theme-toggle-check";
	const toggleButtons = document.querySelectorAll(`.theme-toggle:not(.${checkThemeBtnClass})`);
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

	// バインド後にすべてのトグル ボタン間で視覚的な状態が同期されていることを確認する
	updateAllToggleButtonsUI();
}

function updateToggleButtonUI(btn: Element) {
	const state = safeGet() ?? "auto";
	const sun = btn.querySelector<HTMLElement>(".icon-sun");
	const moon = btn.querySelector<HTMLElement>(".icon-moon");
	const autoI = btn.querySelector<HTMLElement>(".icon-auto");

	if (sun) sun.classList.toggle("hidden", state !== "light");
	if (moon) moon.classList.toggle("hidden", state !== "dark");
	if (autoI) autoI.classList.toggle("hidden", state !== "auto");

	switch (state) {
		case "light":
			btn.setAttribute("aria-label", "テーマ: ライト");
			btn.setAttribute("title", "ライトモード (クリックでダーク)");
			break;
		case "dark":
			btn.setAttribute("aria-label", "テーマ: ダーク");
			btn.setAttribute("title", "ダークモード (クリックで自動)");
			break;
		default:
			btn.setAttribute("aria-label", "テーマ: システムに合わせる");
			btn.setAttribute("title", "システム設定に合わせる (クリックでライト)");
	}
}

function updateAllToggleButtonsUI() {
	document.querySelectorAll<HTMLElement>(".theme-toggle").forEach((b) => updateToggleButtonUI(b));
}

function getNextTheme(current: string | null) {
	const cur = current ?? "auto";
	switch (cur) {
		case "light":
			return "dark";
		case "dark":
			return "auto";
		default:
			return "light";
	}
}

let _mqListenerAdded = false;
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

function initThemeUI() {
	updateTheme();
	bindThemeUI();
	ensureSystemListener();
}

document.addEventListener("DOMContentLoaded", initThemeUI);
document.addEventListener("astro:after-swap", initThemeUI);

document.addEventListener("astro:before-swap", (event) => {
	applyTheme(safeGet() ?? "auto", event.newDocument);
});

if (document.readyState !== "loading") {
	initThemeUI();
}

updateTheme();
