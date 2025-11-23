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

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", attachLinkHandlers);
	} else {
		attachLinkHandlers();
	}

	// Astro のクライアント遷移後にもメニューを閉じる
	window.addEventListener("astro:after-swap", closeMobileMenu);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initMobileMenu);
} else {
	initMobileMenu();
}
