import { DestroyType, type Engine, type IParticlesOptions, type IRangeValue, type ISourceOptions, MoveDirection, OutMode, type RangeValue, type RecursivePartial, StartValueType, rgbToHsl, setRangeValue, stringToRgb } from "@tsparticles/engine";

/**
 *
 * @param engine -
 * @returns 花火プリセットのオプション
 */
export function initOptions(engine: Engine): ISourceOptions {
	const fixRange = (value: IRangeValue, min: number, max: number): RangeValue => {
		const adjustedMin = Math.max(value.min, min);
		const adjustedMax = Math.min(value.max, max);
		return setRangeValue({ min: adjustedMin, max: adjustedMax });
	};

	const colors = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"];
	const sOffset = 30,
		lOffset = 30;

	const fireworksOptions: RecursivePartial<IParticlesOptions>[] = colors
		.map((color) => {
			const rgb = stringToRgb(engine, color);
			if (!rgb) return null;

			const hsl = rgbToHsl(rgb);
			return {
				color: {
					value: {
						h: hsl.h,
						s: fixRange({ min: hsl.s - sOffset, max: hsl.s + sOffset }, 0, 100),
						l: fixRange({ min: hsl.l - lOffset, max: hsl.l + lOffset }, 0, 100),
					},
				},
				stroke: {
					width: 0,
				},
				number: {
					value: 0,
				},
				opacity: {
					value: {
						min: 0.1,
						max: 1,
					},
					animation: {
						enable: true,
						speed: 0.7,
						sync: false,
						startValue: StartValueType.max,
						destroy: DestroyType.min,
					},
				},
				shape: {
					type: "circle",
				},
				size: {
					value: { min: 1, max: 2 },
					animation: {
						enable: true,
						speed: 5,
						count: 1,
						sync: false,
						startValue: StartValueType.min,
						destroy: DestroyType.none,
					},
				},
				life: {
					count: 1,
					duration: {
						value: {
							min: 1,
							max: 2,
						},
					},
				},
				move: {
					decay: { min: 0.075, max: 0.1 },
					enable: true,
					gravity: {
						enable: true,
						inverse: false,
						acceleration: 5,
					},
					speed: { min: 5, max: 15 },
					direction: "none",
					outModes: OutMode.destroy,
				},
			} as RecursivePartial<IParticlesOptions>;
		})
		.filter(Boolean) as RecursivePartial<IParticlesOptions>[];

	return {
		detectRetina: true,
		fpsLimit: 120,
		emitters: {
			direction: MoveDirection.top,
			life: {
				count: 0,
				duration: 0.1,
				delay: 0.1,
			},
			rate: {
				delay: 0.3,
				quantity: 1,
			},
			size: {
				width: 100,
				height: 0,
			},
			position: {
				x: 50,
				y: 100,
			},
		},
		particles: {
			number: {
				value: 0,
			},
			destroy: {
				mode: "split",
				bounds: {
					top: { min: 10, max: 30 },
				},
				split: {
					sizeOffset: false,
					count: 1,
					factor: {
						value: 0.333,
					},
					rate: {
						value: { min: 75, max: 150 },
					},
					particles: fireworksOptions,
				},
			},
			life: {
				count: 1,
			},
			shape: {
				type: "line",
			},
			size: {
				value: {
					min: 0.1,
					max: 50,
				},
				animation: {
					enable: true,
					sync: true,
					speed: 90,
					startValue: StartValueType.max,
					destroy: DestroyType.min,
				},
			},
			stroke: {
				color: {
					value: "#ffffff",
				},
				width: 1,
			},
			rotate: {
				path: true,
			},
			move: {
				enable: true,
				gravity: {
					acceleration: 15,
					enable: true,
					inverse: true,
					maxSpeed: 100,
				},
				speed: {
					min: 10,
					max: 20,
				},
				outModes: {
					default: OutMode.destroy,
					top: OutMode.none,
				},
				trail: {
					fill: {
						color: "#000",
					},
					enable: true,
					length: 10,
				},
			},
		},
	};
}
