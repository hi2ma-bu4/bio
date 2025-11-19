const checkThemeBtnClass = "theme-toggle-check";
function initTheme() {
	const toggleButtons = document.querySelectorAll(`.theme-toggle:not(.${checkThemeBtnClass})`);

	for (const toggleButton of toggleButtons) {
		toggleButton.classList.add(checkThemeBtnClass);
		toggleButton.addEventListener("click", () => {
			// 1. <html> タグの 'dark' クラスを切り替える
			const isDark = document.documentElement.classList.toggle("dark");

			// 2. 切り替え後の状態を localStorage に保存する
			localStorage.setItem("theme", isDark ? "dark" : "light");
		});
	}
}

document.addEventListener("astro:after-swap", initTheme);
initTheme();
