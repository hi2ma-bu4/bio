import { loadBasic } from "@tsparticles/basic";
import type { Engine } from "@tsparticles/engine";
import { loadEmittersPlugin } from "@tsparticles/plugin-emitters";
import { loadEmittersShapeSquare } from "@tsparticles/plugin-emitters-shape-square";
import { loadLineShape } from "@tsparticles/shape-line";
import { loadDestroyUpdater } from "@tsparticles/updater-destroy";
import { loadLifeUpdater } from "@tsparticles/updater-life";
import { loadRotateUpdater } from "@tsparticles/updater-rotate";
import { loadStrokeColorUpdater } from "@tsparticles/updater-stroke-color";
import { initOptions } from "./options.js";

/**
 * 花火プリセットをロードする
 * @param engine - tsparticlesエンジン
 * @param refresh - ロード後にリフレッシュするかどうか
 */
export async function loadFireworksPreset(engine: Engine, refresh = true): Promise<void> {
	await loadBasic(engine, false);
	await loadEmittersPlugin(engine, false);
	await loadEmittersShapeSquare(engine, false);
	await loadLineShape(engine, false);
	await loadRotateUpdater(engine, false);
	await loadDestroyUpdater(engine, false);
	await loadLifeUpdater(engine, false);
	await loadStrokeColorUpdater(engine, false);

	await engine.addPreset("fireworks", initOptions(engine), false);

	await engine.refresh(refresh);
}
