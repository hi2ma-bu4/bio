import { deviceType } from "detect-it";
import { isbot } from "isbot";

import { createEffectLifecycle } from "./libs/effect-lifecycle";
import { FlowKeys } from "./libs/flowkeys/src/FlowKeys";
import { showToast } from "./libs/ui-toast";

const lifecycle = createEffectLifecycle();

function initKeyCommand() {
	const fk = new FlowKeys(window);

	fk.register(["H", "E", "L", "L", "O"], () => showToast("Hi👋"));

	fk.register(
		["B", "O", "M", "B"],
		async () => {
			showToast("💣BombMode: Enabled!");
			const { domOnBomb } = await import("./libs/key-command/boom");

			function init() {
				document.body.addEventListener("click", domOnBomb);
			}
			init();
			lifecycle.addStop(() => {
				document.body.removeEventListener("click", domOnBomb);
			});
			lifecycle.addUpdate(init);
		},
		{ once: true },
	);

	fk.register(
		["M", "I", "R", "R", "O", "R"],
		async () => {
			showToast("🪞MirrorMode: Enabled!");
			const { MirrorMode } = await import("./libs/key-command/mirror");
			const mirror = new MirrorMode();
			mirror.toggle();
			let toggleFlag = true;

			lifecycle.addStop(() => mirror.destroy());
			lifecycle.addUpdate(() => {
				mirror.init();
				if (toggleFlag) mirror.toggle();
			});
			fk.register([["Shift", "M"]], () => {
				mirror.toggle();
				toggleFlag = !toggleFlag;
			});
		},
		{ once: true },
	);

	fk.register(
		["H", "T", "M", "L"],
		async () => {
			const { renderPageAsHtml } = await import("./libs/key-command/html");
			await renderPageAsHtml();
		},
		{ once: true },
	);

	fk.register(
		["L", "E", "N", "S"],
		async () => {
			const { lensMode } = await import("./libs/key-command/lens");
			lensMode.toggle();
			lifecycle.addStop(() => lensMode.destroy());
			lifecycle.addUpdate(() => lensMode.init());
		},
		{ once: true },
	);
}

async function initMobileCommand() {
	const { mobileCommandCenter } = await import("./libs/key-command/mobile-command");
	mobileCommandCenter.init();
}

// クローラー以外の場合のみ動作
if (!isbot(navigator.userAgent)) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			initKeyCommand();
			if (deviceType !== "mouseOnly") {
				initMobileCommand();
			}
		});
	} else {
		initKeyCommand();
		if (deviceType !== "mouseOnly") {
			initMobileCommand();
		}
	}
	document.addEventListener("astro:before-preparation", () => lifecycle.stop());
	document.addEventListener("astro:after-swap", () => lifecycle.update());
}
