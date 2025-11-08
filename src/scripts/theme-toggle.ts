const toggleButton = document.getElementById("theme-toggle");

toggleButton?.addEventListener("click", () => {
	// 1. <html> タグの 'dark' クラスを切り替える
	const isDark = document.documentElement.classList.toggle("dark");

	// 2. 切り替え後の状態を localStorage に保存する
	localStorage.setItem("theme", isDark ? "dark" : "light");
});
