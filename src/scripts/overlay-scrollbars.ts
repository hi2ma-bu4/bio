import { ClickScrollPlugin, OverlayScrollbars, ScrollbarsHidingPlugin, SizeObserverPlugin } from "overlayscrollbars";
import "overlayscrollbars/overlayscrollbars.css";

OverlayScrollbars.plugin([ScrollbarsHidingPlugin, SizeObserverPlugin, ClickScrollPlugin]);

/**
 * カスタムスクロールバーを適用する
 */
function overrideScroll() {
	OverlayScrollbars(document.body, {
		showNativeOverlaidScrollbars: true,
		scrollbars: {
			theme: "os-theme-bio",
			clickScroll: true,
		},
	});
}

document.addEventListener("astro:after-swap", overrideScroll);
overrideScroll();
