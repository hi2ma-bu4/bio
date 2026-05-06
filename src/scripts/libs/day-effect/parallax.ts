import { isbot } from "isbot";

interface ParallaxOptions {
	intensity: number;
	layers: string[];
}

const defaultOptions: ParallaxOptions = {
	intensity: 20,
	layers: [
		"main",
		"#logo",
		".work-card", // 注意: このクラスが存在することを確認するか、タグ/ID でターゲットにする必要がある
		"footer",
		"#bg-canvas",
	],
};

class GyroParallax {
	private options: ParallaxOptions;
	private enabled: boolean = false;
	private handleOrientationBound: (e: DeviceOrientationEvent) => void;

	constructor(options: Partial<ParallaxOptions> = {}) {
		this.options = { ...defaultOptions, ...options };
		this.handleOrientationBound = this.handleOrientation.bind(this);
	}

	public async enable() {
		if (this.enabled) return;
		if (isbot(navigator.userAgent)) return;

		// iOS 13+ のために許可をリクエスト
		if (typeof DeviceOrientationEvent !== "undefined" && typeof (DeviceOrientationEvent as any).requestPermission === "function") {
			try {
				const permission = await (DeviceOrientationEvent as any).requestPermission();
				if (permission !== "granted") {
					console.warn("GyroParallax: Permission denied");
					return;
				}
			} catch (error) {
				console.error("GyroParallax: Permission request error", error);
				return;
			}
		}

		window.addEventListener("deviceorientation", this.handleOrientationBound, true);
		this.enabled = true;
		document.documentElement.style.setProperty("--parallax-transition", "transform 0.1s ease-out");
	}

	public disable() {
		if (!this.enabled) return;
		window.removeEventListener("deviceorientation", this.handleOrientationBound, true);
		this.enabled = false;
		this.resetStyles();
	}

	private handleOrientation(event: DeviceOrientationEvent) {
		if (!this.enabled) return;

		const beta = event.beta; // -180 から 180 (前後方向の傾き)
		const gamma = event.gamma; // -90 から 90 (左右方向の傾き)

		if (beta === null || gamma === null) return;

		// 値を正規化 (デバイスがほぼ直立していると想定)
		// 標準的な直立状態の beta は 45-90 程度
		const x = Math.max(-1, Math.min(1, gamma / 45));
		const y = Math.max(-1, Math.min(1, (beta - 45) / 45));

		this.applyParallax(x, y);
	}

	private applyParallax(x: number, y: number) {
		const { intensity } = this.options;

		// 効率化のために CSS カスタムプロパティを使用
		document.documentElement.style.setProperty("--gyro-x", x.toString());
		document.documentElement.style.setProperty("--gyro-y", y.toString());

		// グローバル変数を使用しない特定の要素に適用
		// ただし、動的な style タグでグローバル変数を使用する方が望ましい
		this.updateDynamicStyles(x * intensity, y * intensity);
	}

	private updateDynamicStyles(moveX: number, moveY: number) {
		const layers = document.querySelectorAll(this.options.layers.join(", "));
		layers.forEach((el, index) => {
			if (!(el instanceof HTMLElement)) return;
			const depth = (index + 1) * 0.5;
			const tx = moveX * depth;
			const ty = moveY * depth;
			el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
			el.style.transition = "transform 0.1s ease-out";
		});
	}

	private resetStyles() {
		const layers = document.querySelectorAll(this.options.layers.join(", "));
		layers.forEach((el) => {
			if (!(el instanceof HTMLElement)) return;
			el.style.transform = "";
			el.style.transition = "";
		});
		document.documentElement.style.removeProperty("--gyro-x");
		document.documentElement.style.removeProperty("--gyro-y");
		document.documentElement.style.removeProperty("--parallax-transition");
	}
}

let parallaxInstance: GyroParallax | null = null;

export function startGyroParallax() {
	if (!parallaxInstance) {
		parallaxInstance = new GyroParallax();
	}
	parallaxInstance.enable();
}

export function stopGyroParallax() {
	parallaxInstance?.disable();
}
