import { showToast } from "../ui-toast";
import { addStyle, removeStyle } from "../ui-utils";
import lensStyles from "./lens.css?inline";

/**
 * 重力レンズ（歪み）エフェクトを制御するクラス
 */
class GravitationalLens {
	/** 有効フラグ */
	private enabled: boolean = false;
	/** SVG要素（フィルター定義用） */
	private svgElement: SVGSVGElement | null = null;
	/** レンズ表示用要素 */
	private lensDiv: HTMLDivElement | null = null;
	/** フィルターのID */
	private filterId = "gravitational-lens-filter";

	/** bind済みのマウス移動ハンドラ */
	private handleMouseMoveBound: (e: MouseEvent) => void;
	/** bind済みのタッチ移動ハンドラ */
	private handleTouchMoveBound: (e: TouchEvent) => void;

	/**
	 * コンストラクタ
	 */
	constructor() {
		this.handleMouseMoveBound = this.handleMouseMove.bind(this);
		this.handleTouchMoveBound = this.handleTouchMove.bind(this);
	}

	/**
	 * 初期化処理を行う
	 */
	public init() {
		if (this.svgElement) return;

		addStyle(lensStyles, "lens-style");

		const svgNs = "http://www.w3.org/2000/svg";
		this.svgElement = document.createElementNS(svgNs, "svg");
		this.svgElement.classList.add("lens-svg");
		this.svgElement.setAttribute("aria-hidden", "true");

		const defs = document.createElementNS(svgNs, "defs");
		const filter = document.createElementNS(svgNs, "filter");
		filter.id = this.filterId;

		const feTurbulence = document.createElementNS(svgNs, "feTurbulence");
		feTurbulence.setAttribute("type", "fractalNoise");
		feTurbulence.setAttribute("baseFrequency", "0.01");
		feTurbulence.setAttribute("numOctaves", "2");
		feTurbulence.setAttribute("result", "noise");

		const feDisplacementMap = document.createElementNS(svgNs, "feDisplacementMap");
		feDisplacementMap.setAttribute("in", "SourceGraphic");
		feDisplacementMap.setAttribute("in2", "noise");
		feDisplacementMap.setAttribute("scale", "40");
		feDisplacementMap.setAttribute("xChannelSelector", "R");
		feDisplacementMap.setAttribute("yChannelSelector", "G");

		filter.appendChild(feTurbulence);
		filter.appendChild(feDisplacementMap);
		defs.appendChild(filter);
		this.svgElement.appendChild(defs);
		document.body.appendChild(this.svgElement);

		this.lensDiv = document.createElement("div");
		this.lensDiv.id = "lens-element";
		this.lensDiv.style.backdropFilter = `url(#${this.filterId})`;
		if ("webkitBackdropFilter" in this.lensDiv.style) (this.lensDiv.style as any).webkitBackdropFilter = `url(#${this.filterId})`;
		document.body.appendChild(this.lensDiv);
	}

	/**
	 * 有効/無効を切り替える
	 */
	public toggle() {
		if (this.enabled) {
			this.disable();
		} else {
			this.enable();
		}
	}

	/**
	 * エフェクトを有効化する
	 */
	public enable() {
		if (this.enabled) return;
		this.init();
		this.enabled = true;
		if (this.lensDiv) this.lensDiv.style.display = "block";
		window.addEventListener("mousemove", this.handleMouseMoveBound);
		window.addEventListener("touchmove", this.handleTouchMoveBound);
		showToast("🔭GravitationalLens: Enabled!");
	}

	/**
	 * エフェクトを無効化する
	 */
	public disable() {
		if (!this.enabled) return;
		this.enabled = false;
		if (this.lensDiv) this.lensDiv.style.display = "none";
		window.removeEventListener("mousemove", this.handleMouseMoveBound);
		window.removeEventListener("touchmove", this.handleTouchMoveBound);
		showToast("🔭GravitationalLens: Disabled");
	}

	/**
	 * マウス移動イベントハンドラ
	 * @param e - マウスイベント
	 */
	private handleMouseMove(e: MouseEvent) {
		this.updatePosition(e.clientX, e.clientY);
	}

	/**
	 * タッチ移動イベントハンドラ
	 * @param e - タッチイベント
	 */
	private handleTouchMove(e: TouchEvent) {
		if (e.touches.length > 0) {
			this.updatePosition(e.touches[0].clientX, e.touches[0].clientY);
		}
	}

	/**
	 * レンズの位置を更新する
	 * @param x - X座標
	 * @param y - Y座標
	 */
	private updatePosition(x: number, y: number) {
		if (this.lensDiv) {
			this.lensDiv.style.left = `${x}px`;
			this.lensDiv.style.top = `${y}px`;
		}
	}

	/**
	 * 破棄処理を行う
	 */
	public destroy() {
		this.disable();
		this.svgElement?.remove();
		this.lensDiv?.remove();
		this.svgElement = null;
		this.lensDiv = null;
		removeStyle("lens-style");
	}
}

/** GravitationalLensインスタンス */
export const lensMode = new GravitationalLens();
