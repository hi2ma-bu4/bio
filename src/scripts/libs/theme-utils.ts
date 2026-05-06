/** ローカルストレージで使用するキー */
export const STORAGE_KEY = "theme";

export type themeType = "light" | "dark" | "auto";

let isThemeLock: boolean = false;
let lockTheme: themeType | null = null;

/**
 * ローカルストレージからテーマ設定を取得する
 * @returns 設定されているテーマ、またはnull
 */
export function safeGet(): themeType | null {
	return typeof localStorage !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as themeType | null) : null;
}

/**
 * ローカルストレージにテーマ設定を保存する
 * @param v - 設定するテーマ
 */
export function safeSet(v: themeType) {
	if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, v);
}

/**
 * 指定したドキュメントにテーマを適用する
 * @param mode - 適用するテーマ
 * @param doc - 対象のドキュメント（デフォルトは現在のdocument）
 * @param transition - アニメーションを適用するかどうか
 */
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

/**
 * ストレージの設定に基づきテーマを更新する
 * @param transition - アニメーションを適用するかどうか
 */
export function updateTheme(transition: boolean = true) {
	applyTheme(safeGet() ?? "auto", document, transition);
}

/**
 * テーマ切り替えボタンの表示（アイコン・ラベル）を更新する
 * @param btn - 対象のボタン要素
 */
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

/**
 * ページ内の全てのテーマ切り替えボタンの表示を更新する
 */
export function updateAllToggleButtonsUI() {
	document.querySelectorAll<HTMLButtonElement>(".theme-toggle").forEach((b) => updateToggleButtonUI(b));
}

/**
 * 次のテーマ設定を取得する (light -> dark -> auto -> light)
 * @param current - 現在のテーマ
 * @returns 次のテーマ
 */
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

/**
 * テーマの変更をロックまたは解除する
 * @param flag - ロックするかどうか
 * @param mode - ロック時に強制するテーマ
 * @param doc - 対象のドキュメント
 */
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
	themeChangeLock(isThemeLock, null, (event as any).newDocument);
});
