import { loadBasic } from "@tsparticles/basic";
import type { Engine } from "@tsparticles/engine";
import { loadEmittersPlugin } from "@tsparticles/plugin-emitters";
import { loadHeartShape } from "@tsparticles/shape-heart";
import { initOptions } from "./options.js";

/**
 * ハートの泡プリセットをロードする
 * @param engine - tsparticlesエンジン
 * @param refresh - ロード後にリフレッシュするかどうか
 */
export async function loadHeartBubblePreset(engine: Engine, refresh = true): Promise<void> {
	await loadBasic(engine, false);
	await loadHeartShape(engine, false);
	await loadEmittersPlugin(engine, false);

	await engine.addPreset("heart-bubble", initOptions(engine), false);

	await engine.refresh(refresh);
}
