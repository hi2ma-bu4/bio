import { isbot } from "isbot";

import { FlowKeys } from "./libs/flowkeys/dist/FlowKeys";
import { showToast } from "./libs/ui-toast";

const stopFunc: (() => void)[] = [];
const updateFunc: (() => void)[] = [];

function initKeyCommand() {
	const fk = new FlowKeys(window);

	fk.register(["H", "E", "L", "L", "O"], () => showToast("Hi👋"));

	fk.register(
		["B", "O", "M", "B"],
		async () => {
			showToast("💣BombMode: Enabled!");
			const { domOnBomb } = await import("./libs/key-command/boom-on-click");

			function init() {
				document.body.addEventListener("click", domOnBomb);
			}
			init();
			stopFunc.push(() => {
				document.body.removeEventListener("click", domOnBomb);
			});
			updateFunc.push(init);
		},
		{ once: true }
	);

	fk.register(
		["M", "I", "R", "R", "O", "R"],
		async () => {
			showToast("🪞MirrorMode: Enabled!");
			const { MirrorMode } = await import("./libs/key-command/mirror");
			const mirror = new MirrorMode();
			mirror.toggle();
			let toggleFlag = true;

			stopFunc.push(() => mirror.destroy());
			updateFunc.push(() => {
				mirror.init();
				if (toggleFlag) mirror.toggle();
			});
			fk.register([["Shift", "M"]], () => {
				mirror.toggle();
				toggleFlag = !toggleFlag;
			});
		},
		{ once: true }
	);
}

function stop() {
	stopFunc.forEach((fn) => fn?.());
}
function update() {
	updateFunc.forEach((fn) => fn?.());
}

// クローラー以外の場合のみ動作
if (!isbot(navigator.userAgent) && !/android|iphone|ipad|mobile/i.test(navigator.userAgent)) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initKeyCommand);
	} else {
		initKeyCommand();
	}
	document.addEventListener("astro:before-preparation", stop);
	document.addEventListener("astro:after-swap", update);
}
