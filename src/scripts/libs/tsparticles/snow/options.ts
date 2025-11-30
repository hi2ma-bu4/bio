import { MoveDirection, OutMode, type Engine, type ISourceOptions } from "@tsparticles/engine";

/**
 *
 * @param engine -
 * @returns 降雪プリセットのオプション
 */
export function initOptions(engine: Engine): ISourceOptions {
	return {
		detectRetina: true,
		fpsLimit: 60,
		particles: {
			number: {
				value: 400,
				density: {
					enable: true,
					width: 1920,
					height: 1080,
				},
			},
			color: { value: "#fff" },
			shape: { type: "circle" },
			opacity: {
				value: { min: 0.05, max: 0.4 },
			},
			size: {
				value: { min: 1, max: 8 },
			},
			move: {
				enable: true,
				speed: { min: 1, max: 3 },
				direction: MoveDirection.bottom,
				straight: false,
				outModes: { default: OutMode.out, top: OutMode.none },
				gravity: { enable: false },
			},
		},
		interactivity: {
			detectsOn: "window",
			events: {
				onHover: { enable: true, mode: "bubble" },
				onClick: { enable: true, mode: "repulse" },
				resize: { enable: true },
			},
			modes: {
				bubble: {
					distance: 300,
					size: 4,
					duration: 0.3,
					opacity: 0.9,
					speed: 3,
				},
				repulse: {
					distance: 200,
					duration: 0.4,
				},
			},
		},
	};
}
