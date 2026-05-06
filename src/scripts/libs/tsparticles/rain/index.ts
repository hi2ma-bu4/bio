import { loadBasic } from "@tsparticles/basic";
import type { Engine } from "@tsparticles/engine";
import { loadExternalRepulseInteraction } from "@tsparticles/interaction-external-repulse";
import { loadLineShape } from "@tsparticles/shape-line";
import { loadRotateUpdater } from "@tsparticles/updater-rotate";
import { loadStrokeColorUpdater } from "@tsparticles/updater-stroke-color";
import { initOptions } from "./options.js";

/**
 * 雨プリセットをロードする
 * @param engine - tsparticlesエンジン
 * @param refresh - ロード後にリフレッシュするかどうか
 */
export async function loadRainPreset(engine: Engine, refresh = true): Promise<void> {
	await loadBasic(engine, false);
	await loadLineShape(engine, false);
	await loadRotateUpdater(engine, false);
	await loadStrokeColorUpdater(engine, false);
	await loadExternalRepulseInteraction(engine, false);

	await engine.addPreset("rain", initOptions(engine), false);

	await engine.refresh(refresh);
}
