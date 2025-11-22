const checkThemeBtnClass = "theme-toggle-check";
function initTheme() {
	const toggleButtons = document.querySelectorAll(`.theme-toggle:not(.${checkThemeBtnClass})`);

	for (const toggleButton of toggleButtons) {
		toggleButton.classList.add(checkThemeBtnClass);

		const updateAriaLabel = () => {
			const isDark = document.documentElement.classList.contains("dark");
			if (isDark) {
				toggleButton.setAttribute("aria-label", "ライトモードに切り替える");
			} else {
				toggleButton.setAttribute("aria-label", "ダークモードに切り替える");
			}
		};

		toggleButton.addEventListener("click", () => {
			// 1. <html> タグの 'dark' クラスを切り替える
			const isDark = document.documentElement.classList.toggle("dark");

			// 2. 切り替え後の状態を localStorage に保存する
			localStorage.setItem("theme", isDark ? "dark" : "light");

			// 3. aria-label を更新する
			updateAriaLabel();
		});
		// 初期表示時にも aria-label を設定
		updateAriaLabel();
	}
}

document.addEventListener("astro:after-swap", initTheme);
initTheme();
