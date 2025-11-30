import { MoveDirection, OutMode, type Engine, type ISourceOptions } from "@tsparticles/engine";
import { SVGs } from "./svgs";

/**
 *
 * @param engine -
 * @returns 紅葉プリセットのオプション
 */
export function initOptions(engine: Engine): ISourceOptions {
	const imageSetting = SVGs.map((svg) => ({ src: "data:image/svg+xml;utf8," + encodeURIComponent(svg), width: 16, height: 16 }));

	return {
		detectRetina: true,
		fpsLimit: 60,
		autoPlay: true,
		particles: {
			number: {
				value: 200,
				density: {
					enable: true,
					width: 1920,
					height: 1080,
				},
			},
			shape: {
				type: "image",
				options: {
					image: imageSetting,
				},
			},
			size: {
				value: { min: 7, max: 15 },
			},
			opacity: {
				value: { min: 0.3, max: 0.7 },
			},
			move: {
				enable: true,
				speed: { min: 2, max: 3 },
				direction: MoveDirection.bottomRight,
				straight: false,
				outModes: {
					default: OutMode.out,
				},
				gravity: {
					enable: false,
				},
			},
			roll: {
				enable: true,
				mode: "both",
				speed: { min: 10, max: 20 },
				darken: {
					enable: true,
					value: 15,
				},
			},
			wobble: {
				enable: true,
				distance: 30,
				speed: { min: 5, max: 10 },
			},
			tilt: {
				enable: true,
				direction: "random",
				value: { min: 0, max: 360 },
				animation: { enable: true, speed: 10 },
			},
		},
	};
}
