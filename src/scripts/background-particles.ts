import { tsParticles } from "@tsparticles/engine";
import { isbot } from "isbot";

import { nowYearlyEvent } from "./libs/match-yearly-range";
import { getQueryParams } from "./libs/query";
import { themeChangeLock, updateAllToggleButtonsUI, type themeType } from "./libs/theme-utils";

async function initParticles() {
	let preset: string = "";

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
			case "autumn-leaves":
				preset = nowYearlyEvent;
				break;
			case "christmas":
				preset = "snow";
		}
	}

	let theme: themeType | null = null;
	switch (preset) {
		case "sakura": {
			const { loadSakuraPreset } = await import("./libs/tsparticles/sakura");
			await loadSakuraPreset(tsParticles);
			break;
		}
		case "fireworks": {
			const { loadFireworksPreset } = await import("./libs/tsparticles/fireworks");
			await loadFireworksPreset(tsParticles);
			theme = "dark";
			break;
		}
		case "autumn-leaves": {
			const { loadAutumnLeavesPreset } = await import("./libs/tsparticles/autumn-leaves");
			await loadAutumnLeavesPreset(tsParticles);
			break;
		}
		case "snow":
			const { loadSnowPreset } = await import("./libs/tsparticles/snow");
			await loadSnowPreset(tsParticles);
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

	await tsParticles.load({
		id: "bg-particles",
		options: {
			preset,
		},
	});
}

// クローラー以外の場合のみ動作
if (!isbot(navigator.userAgent)) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initParticles);
	} else {
		initParticles();
	}
}
