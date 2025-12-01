import { type Engine, type ISourceOptions, MoveDirection, OutMode } from "@tsparticles/engine";

export function initOptions(engine: Engine): ISourceOptions {
	return {
		detectRetina: true,
		fpsLimit: 60,
		particles: {
			color: {
				value: "random",
			},
			shape: {
				type: "heart",
			},
			opacity: {
				value: 0.3,
			},
			size: {
				value: { min: 5, max: 10 },
			},
			move: {
				angle: {
					offset: 0,
					value: 30,
				},
				enable: true,
				speed: 15,
				direction: MoveDirection.top,
				random: false,
				straight: false,
				outModes: {
					default: OutMode.destroy,
				},
			},
		},
		emitters: [
			{
				direction: MoveDirection.top,
				position: {
					y: 100,
				},
				life: {
					duration: 2,
					delay: 1.5,
					count: 0,
				},
			},
			{
				direction: MoveDirection.top,
				position: {
					y: 100,
				},
				life: {
					duration: 3,
					delay: 2.5,
					count: 0,
				},
			},
		],
	};
}
