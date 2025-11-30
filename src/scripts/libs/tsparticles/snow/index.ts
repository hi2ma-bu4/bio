import { loadBasic } from "@tsparticles/basic";
import type { Engine } from "@tsparticles/engine";
import { loadExternalBubbleInteraction } from "@tsparticles/interaction-external-bubble";
import { loadExternalRepulseInteraction } from "@tsparticles/interaction-external-repulse";
import { initOptions } from "./options.js";

/**
 *
 * @param engine -
 * @param refresh -
 */
export async function loadSnowPreset(engine: Engine, refresh = true): Promise<void> {
	await loadBasic(engine, false);
	await loadExternalBubbleInteraction(engine, false);
	await loadExternalRepulseInteraction(engine, false);

	await engine.addPreset("snow", initOptions(engine), false);

	await engine.refresh(refresh);
}
