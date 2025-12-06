import type { Engine } from "@tsparticles/engine";
import { isbot } from "isbot";

import { nowYearlyEvent } from "./libs/match-yearly-range";
import { getQueryParams } from "./libs/query";
import { themeChangeLock, updateAllToggleButtonsUI, type themeType } from "./libs/theme-utils";

const stopFunc: (() => void)[] = [];
const updateFunc: (() => void)[] = [];

async function initParticles() {
	let preset: string = "";
	let pageThemeClass: string = "";

	const params = getQueryParams(["effect"]);
	if (params.effect) {
		let effect: string;
		if (Array.isArray(params.effect)) {
			effect = params.effect[0];
		} else {
			effect = params.effect;
		}
		preset = effect.toLowerCase();
	} else {
		switch (nowYearlyEvent) {
			case "sakura":
			case "fireworks":
			case "programmers-day":
			case "autumn-leaves":
				preset = nowYearlyEvent;
				break;
			case "valentine":
			case "white-day":
				preset = "heart-bubble";
				break;
			case "april-fool":
				break;
			case "golden-week":
				break;
			case "rainy-season":
				preset = "rain";
				break;
			case "star-festival":
				break;
			case "harvest-moon":
				break;
			case "halloween":
				break;
			case "christmas":
				preset = "snow";
				break;
		}
	}

	let theme: themeType | null = null;
	let loadPreset: ((engine: Engine, refresh?: boolean) => Promise<void>) | null = null;
	switch (preset) {
		case "heart-bubble": {
			const { loadHeartBubblePreset } = await import("./libs/tsparticles/heart-bubble");
			loadPreset = loadHeartBubblePreset;
			pageThemeClass = "theme-pink";
			break;
		}
		case "sakura": {
			const { loadSakuraPreset } = await import("./libs/tsparticles/sakura");
			loadPreset = loadSakuraPreset;
			break;
		}
		case "rain": {
			const { loadRainPreset } = await import("./libs/tsparticles/rain");
			loadPreset = loadRainPreset;
			theme = "dark";
			break;
		}
		case "fireworks": {
			const { loadFireworksPreset } = await import("./libs/tsparticles/fireworks");
			loadPreset = loadFireworksPreset;
			theme = "dark";
			break;
		}
		case "programmers-day": {
			// 特殊動作
			theme = "light";
			const { PseudoDebugKit } = await import("./libs/pseudo-debugkit/src/index");
			const pseudoDebugKit = new PseudoDebugKit({
				panel: false,
				shortcuts: true,
			});
			function init() {
				pseudoDebugKit.init();
				pseudoDebugKit.enable();
				pseudoDebugKit.setWire(true);
				pseudoDebugKit.setHighlight(true);
			}
			init();
			stopFunc.push(() => {
				pseudoDebugKit.disable();
				pseudoDebugKit.destroy();
			});
			updateFunc.push(init);
			break;
		}
		case "autumn-leaves": {
			const { loadAutumnLeavesPreset } = await import("./libs/tsparticles/autumn-leaves");
			loadPreset = loadAutumnLeavesPreset;
			pageThemeClass = "theme-amber";
			break;
		}
		case "snow":
			const { loadSnowPreset } = await import("./libs/tsparticles/snow");
			loadPreset = loadSnowPreset;
			theme = "dark";
			break;
		default:
			return;
	}

	// DOM が ready になってからロード
	const el = document.getElementById("bg-particles");
	if (!el) return;

	if (theme) {
		themeChangeLock(true, theme);
		updateAllToggleButtonsUI();
	}
	if (pageThemeClass) {
		document.body.classList.add(pageThemeClass);
		document.addEventListener("astro:before-swap", (event) => {
			event.newDocument.body.classList.add(pageThemeClass);
		});
	}

	if (loadPreset) {
		const { tsParticles } = await import("@tsparticles/engine");
		await loadPreset(tsParticles);
		await tsParticles.load({
			id: "bg-particles",
			options: {
				preset,
			},
		});
	}
}

function stop() {
	stopFunc.forEach((fn) => fn?.());
}

function update() {
	updateFunc.forEach((fn) => fn?.());
}

// クローラー以外の場合のみ動作
if (!isbot(navigator.userAgent)) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initParticles);
	} else {
		initParticles();
	}
	document.addEventListener("astro:before-preparation", stop);
	document.addEventListener("astro:after-swap", update);
}
