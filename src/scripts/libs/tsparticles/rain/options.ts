import { MoveDirection, OutMode, type Engine, type ISourceOptions } from "@tsparticles/engine";

/**
 * 雨プリセットのオプションを初期化する
 * @param engine - tsparticlesエンジン
 * @returns 雨プリセットのオプション
 */
export function initOptions(engine: Engine): ISourceOptions {
	return {
		detectRetina: true,
		fpsLimit: 60,
		particles: {
			number: {
				value: 250,
				density: {
					enable: true,
					width: 1920,
					height: 1080,
				},
			},
			shape: {
				type: "line",
			},
			size: {
				value: { min: 10, max: 20 },
			},
			stroke: {
				width: { min: 0.8, max: 1.5 },
				color: { value: "#a9c5ff" },
				opacity: { min: 0.3, max: 0.8 },
			},
			move: {
				enable: true,
				speed: { min: 20, max: 45 },
				direction: MoveDirection.bottomRight,
				angle: {
					offset: 20,
					value: 25, // 斜め角度
				},
				straight: true,
				outModes: { default: OutMode.out, top: OutMode.none },
				gravity: {
					enable: true,
					acceleration: 9.8, // 重力をしっかり効かせる
					inverse: false,
				},
			},
			rotate: {
				value: 45,
				animation: { enable: false },
				path: false,
			},
		},
		interactivity: {
			detectsOn: "window",
			events: {
				onHover: { enable: true, mode: "repulse" },
				resize: { enable: true },
			},
			modes: {
				repulse: {
					distance: 150,
					duration: 0.4,
				},
			},
		},
	};
}
