import type { Engine } from "@tsparticles/engine";
import { isbot } from "isbot";

import { ID_BACK_CANVAS_MINI } from "../config";
import { createEffectLifecycle } from "./libs/effect-lifecycle";
import { nowYearlyEvent } from "./libs/match-yearly-range";
import { getQueryParams } from "./libs/query";
import { styledLog, type LogPart } from "./libs/styledConsole";
import { themeChangeLock, updateAllToggleButtonsUI, type themeType } from "./libs/theme-utils";
import { loadFont } from "./libs/ui-utils";

const lifecycle = createEffectLifecycle();

/**
 * ライフサイクルに管理されたエフェクトを開始・登録する
 * @param start - 開始関数
 * @param stop - 停止関数
 * @param options - オプション
 */
function attachManagedEffect(start: () => void | null, stop: () => void | null, options: { restartOnSwap?: boolean } = {}): void {
	const { restartOnSwap = true } = options;
	start?.();
	if (stop) {
		lifecycle.addStop(stop);
	}
	if (start && restartOnSwap) {
		lifecycle.addUpdate(start);
	}
}

/**
 * ページのテーマクラスを同期する
 * @param pageThemeClass - テーマクラス名
 */
function syncPageTheme(pageThemeClass: string): void {
	if (!pageThemeClass) return;

	document.body.classList.add(pageThemeClass);
	document.addEventListener("astro:before-swap", (event) => {
		(event as Event & { newDocument: Document }).newDocument.body.classList.add(pageThemeClass);
	});
}

/**
 * パーティクルエフェクトを初期化する
 */
async function initParticles() {
	let preset: string | null = null;
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
			case "error-day":
				preset = "bsod";
				break;
			case "virus-day":
				preset = "virus";
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
				preset = "star-weaver";
				break;
			case "harvest-moon":
				preset = "moon-jumper";
				break;
			case "lottery-day":
				preset = "random";
				break;
			case "world-testers-day":
				preset = "bug-hunt";
				break;
			case "genshin-anniversary":
				preset = "genshin";
				break;
			case "halloween":
				preset = "lifegame";
				break;
			case "labor-thanksgiving":
				preset = "8-bit";
				break;
			case "world-development-information-day":
				preset = "parallax";
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
		case "bsod": {
			const { startBsodEffect, stopBsodEffect } = await import("./libs/day-effect/bsod");
			attachManagedEffect(startBsodEffect, stopBsodEffect, { restartOnSwap: false });
			break;
		}
		case "gravity": {
			const { initializePhysicsEngine, stopPhysicsEngine } = await import("./libs/day-effect/gravity");
			attachManagedEffect(initializePhysicsEngine, stopPhysicsEngine);
			break;
		}
		case "random": {
			const { startRandomEffect, stopRandomEffect } = await import("./libs/day-effect/random");
			attachManagedEffect(startRandomEffect, stopRandomEffect);
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
				lifecycle.addUpdate(init);
			}
			break;
		}
		case "star-weaver": {
			const { startStarWeaver, stopStarWeaver } = await import("./libs/day-effect/star-weaver");
			attachManagedEffect(startStarWeaver, stopStarWeaver);
			theme = "dark";
			break;
		}
		case "moon-jumper": {
			const { startMoonJumper, stopMoonJumper } = await import("./libs/day-effect/moon-jumper");
			attachManagedEffect(startMoonJumper, stopMoonJumper);
			break;
		}
		case "bug-hunt": {
			const { startBugHunt, stopBugHunt } = await import("./libs/day-effect/bug-hunt");
			attachManagedEffect(startBugHunt, stopBugHunt);
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
			lifecycle.addStop(() => {
				pseudoDebugKit.disable();
				pseudoDebugKit.destroy();
			});
			lifecycle.addUpdate(init);
			theme = "light";
			break;
		}
		case "autumn-leaves": {
			const { loadAutumnLeavesPreset } = await import("./libs/tsparticles/autumn-leaves");
			loadPreset = loadAutumnLeavesPreset;
			pageThemeClass = "theme-amber";
			break;
		}
		case "genshin": {
			const FONT_URL = `/bio/fonts/hyWenHei.ttf`;
			const init = await loadFont("hyWenHei", FONT_URL);
			if (init) {
				init();
				lifecycle.addUpdate(init);
			}
			break;
		}
		case "lifegame": {
			const { startLifeGameEffect, stopLifeGameEffect } = await import("./libs/day-effect/lifegame");
			attachManagedEffect(startLifeGameEffect, stopLifeGameEffect);
			theme = "dark";
			break;
		}
		case "virus": {
			const { startVirusEffect, stopVirusEffect } = await import("./libs/day-effect/virus");
			attachManagedEffect(startVirusEffect, stopVirusEffect);
			break;
		}
		case "8-bit": {
			const { startRetro8bit, destroyRetro8bit } = await import("./libs/day-effect/retro8bit");
			attachManagedEffect(startRetro8bit, destroyRetro8bit);
			const FONT_URL = `/bio/fonts/EnkaDotGothic24/EnkaDotGothic24.ttf`;
			await loadFont("EnkaDotGothic24", FONT_URL);
			theme = "dark";
			break;
		}
		case "parallax": {
			const { startGyroParallax, stopGyroParallax } = await import("./libs/day-effect/parallax");
			attachManagedEffect(startGyroParallax, stopGyroParallax);
			break;
		}
		case "snow":
			const { loadSnowPreset } = await import("./libs/tsparticles/snow");
			loadPreset = loadSnowPreset;
			theme = "dark";
			break;
		default: {
			if (!preset || Math.random() >= 0.01) {
				const { infiniteBasement } = await import("./libs/day-effect/infinite-basement");
				infiniteBasement.init();
				return;
			}

			// 1% の確率でエフェクトを表示
			const { startBsodEffect, stopBsodEffect } = await import("./libs/day-effect/bsod");
			attachManagedEffect(startBsodEffect, stopBsodEffect, { restartOnSwap: false });
			break;
		}
	}

	if (theme) {
		themeChangeLock(true, theme);
		updateAllToggleButtonsUI();
	}
	syncPageTheme(pageThemeClass);

	if (loadPreset && preset) {
		// DOM が ready になってからロード
		const el = document.getElementById("bg-canvas");
		if (!el) return;

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

/**
 * コンソールログのスタイル出力を初期化する
 */
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
	lifecycle.addUpdate(init);
}

// クローラー以外の場合のみ動作
if (!isbot(navigator.userAgent)) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initParticles);
	} else {
		initParticles();
	}
	initLog();
	document.addEventListener("astro:before-preparation", () => lifecycle.stop());
	document.addEventListener("astro:after-swap", () => lifecycle.update());
}
