import type { Engine } from "@tsparticles/engine";
import { isbot } from "isbot";

import { ID_BACK_CANVAS_MINI } from "../config";
import { nowYearlyEvent } from "./libs/match-yearly-range";
import { getQueryParams } from "./libs/query";
import { styledLog, type LogPart } from "./libs/styledConsole";
import { themeChangeLock, updateAllToggleButtonsUI, type themeType } from "./libs/theme-utils";
import { loadFont } from "./libs/ui-utils";

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
			case "tetris":
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
				preset = "gravity";
				break;
			case "golden-week":
				break;
			case "rainy-season":
				preset = "rain";
				break;
			case "world-ufo-day":
				preset = "absentglyph";
				break;
			case "star-festival":
				break;
			case "harvest-moon":
				break;
			case "halloween":
				break;
			case "labor-thanksgiving":
				preset = "8-bit";
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
		case "gravity": {
			const { initializePhysicsEngine } = await import("./libs/day-effect/gravity");
			initializePhysicsEngine();
			break;
		}
		case "tetris": {
			const { Tetris } = await import("./libs/day-effect/tetris");

			const canvas = document.createElement("canvas");
			canvas.id = ID_BACK_CANVAS_MINI;
			const div = document.getElementById("bg-canvas");
			if (!div) break;
			div.appendChild(canvas);

			const tetris = new Tetris(canvas);
			window.addEventListener("keydown", (e) => tetris.handleKey(e));

			function loop() {
				tetris.update();
				tetris.draw();
				requestAnimationFrame(loop);
			}
			loop();
			break;
		}
		case "rain": {
			const { loadRainPreset } = await import("./libs/tsparticles/rain");
			loadPreset = loadRainPreset;
			theme = "dark";
			break;
		}
		case "absentglyph": {
			const FONT_URL = `/RepoShowcase/public/absentglyph/fonts/absentglyph.ttf?v=${Date.now()}`;
			const init = await loadFont("AbsentGlyph", FONT_URL);
			if (init) {
				init();
				updateFunc.push(init);
			}
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
			const { PseudoDebugKit } = await import("./libs/pseudo-debugkit/src/PseudoDebugKit");
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
			theme = "light";
			break;
		}
		case "autumn-leaves": {
			const { loadAutumnLeavesPreset } = await import("./libs/tsparticles/autumn-leaves");
			loadPreset = loadAutumnLeavesPreset;
			pageThemeClass = "theme-amber";
			break;
		}
		case "8-bit": {
			const { startRetro8bit, destroyRetro8bit } = await import("./libs/day-effect/retro8bit");
			startRetro8bit();
			stopFunc.push(destroyRetro8bit);
			updateFunc.push(startRetro8bit);
			const FONT_URL = `/bio/fonts/EnkaDotGothic24/EnkaDotGothic24.ttf`;
			await loadFont("EnkaDotGothic24", FONT_URL);
			theme = "dark";
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
	const el = document.getElementById("bg-canvas");
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
			id: "bg-canvas",
			options: {
				preset,
			},
		});
	}
}

function initLog() {
	const logs: LogPart[] = [
		{ text: "SnowsSite\n", style: "font-weight: bold; font-size: 20px;", mode: "gradient", gradientFrom: "#00a6f4", gradientTo: "#4f39f6" },
		{ text: "Hi👋", style: "color: #c3cfe2;font-weight: bold; font-size: 16px;" },
		{ text: "何か探し物ですか？\n", style: "font-weight: bold; font-size: 16px;", mode: "gradient", gradientFrom: "#96e6a1", gradientTo: "#84fab0" },
		{ text: "一緒にこちらもいかがでしょうか。\n", style: "font-style: italic; font-size: 14px;", mode: "rainbow" },
		{ text: "https://github.com/hi2ma-bu4/bio", style: "text-decoration: underline; font-size: 12px;" },
	];
	function init() {
		styledLog(logs);
	}
	init();
	updateFunc.push(init);
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
	initLog();
	document.addEventListener("astro:before-preparation", stop);
	document.addEventListener("astro:after-swap", update);
}
