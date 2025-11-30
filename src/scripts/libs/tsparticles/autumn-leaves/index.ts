import { loadBasic } from "@tsparticles/basic";
import type { Engine } from "@tsparticles/engine";
import { loadImageShape } from "@tsparticles/shape-image";
import { loadRollUpdater } from "@tsparticles/updater-roll";
import { loadTiltUpdater } from "@tsparticles/updater-tilt";
import { loadWobbleUpdater } from "@tsparticles/updater-wobble";
import { initOptions } from "./options.js";

/**
 *
 * @param engine -
 * @param refresh -
 */
export async function loadAutumnLeavesPreset(engine: Engine, refresh = true): Promise<void> {
	await loadBasic(engine, false);
	await loadImageShape(engine, false);
	await loadRollUpdater(engine, false);
	await loadTiltUpdater(engine, false);
	await loadWobbleUpdater(engine, false);

	await engine.addPreset("autumn-leaves", initOptions(engine), false);

	await engine.refresh(refresh);
}
