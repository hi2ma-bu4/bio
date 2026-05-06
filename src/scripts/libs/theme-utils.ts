export const STORAGE_KEY = "theme";

export type themeType = "light" | "dark" | "auto";

let isThemeLock: boolean = false;
let lockTheme: themeType | null = null;

export function safeGet(): themeType | null {
	return typeof localStorage !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as themeType | null) : null;
}
export function safeSet(v: themeType) {
	if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, v);
}

export function applyTheme(mode: themeType, doc: Document = document, transition: boolean = true) {
	// 変更禁止状態
	if (isThemeLock) {
		if (!lockTheme) return;
		mode = lockTheme;
	}

	if (transition && doc === document) {
		document.documentElement.setAttribute("data-theme-transition", "");
		setTimeout(() => {
			document.documentElement.removeAttribute("data-theme-transition");
		}, 1100);
	}

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
export function updateTheme(transition: boolean = true) {
	applyTheme(safeGet() ?? "auto", document, transition);
}

export function updateToggleButtonUI(btn: HTMLElement) {
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

export function updateAllToggleButtonsUI() {
	document.querySelectorAll<HTMLButtonElement>(".theme-toggle").forEach((b) => updateToggleButtonUI(b));
}

export function getNextTheme(current: themeType | null) {
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

export function themeChangeLock(flag: boolean, mode: themeType | null = null, doc?: Document) {
	const transition = !doc; // 現在のドキュメントの場合のみトランジションを適用（手動/エフェクトによる変更）
	if (flag) {
		if (mode) {
			lockTheme = mode;
			applyTheme(lockTheme, doc, transition);
		} else applyTheme(safeGet() ?? "auto", doc, transition);
	} else {
		lockTheme = null;
	}
	isThemeLock = flag;
}

document.addEventListener("astro:before-swap", (event) => {
	themeChangeLock(isThemeLock, null, event.newDocument);
});
