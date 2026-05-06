import { isbot } from "isbot";

import { AdBlockDetector } from "./libs/ad-check";
import { showToast } from "./libs/ui-toast";

const adDetector = new AdBlockDetector({ debug: false });

/**
 * 広告ブロックを検出し、トーストを表示する
 */
async function checkAd() {
	if (await adDetector.detect()) {
		showToast("👀");
	}
}

if (!isbot(navigator.userAgent)) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", checkAd);
	} else {
		checkAd();
	}
	document.addEventListener("astro:after-swap", () => checkAd());
}
