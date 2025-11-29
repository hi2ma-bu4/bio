import { ClickScrollPlugin, OverlayScrollbars, ScrollbarsHidingPlugin, SizeObserverPlugin } from "overlayscrollbars";
import "overlayscrollbars/overlayscrollbars.css";

OverlayScrollbars.plugin([ScrollbarsHidingPlugin, SizeObserverPlugin, ClickScrollPlugin]);

function overrideScroll() {
	OverlayScrollbars(document.body, {
		showNativeOverlaidScrollbars: true,
		scrollbars: {
			clickScroll: true,
		},
	});
}

document.addEventListener("astro:after-swap", overrideScroll);
overrideScroll();
