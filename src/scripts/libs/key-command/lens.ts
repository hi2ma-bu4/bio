import { showToast } from "../ui-toast";
import { addStyle, removeStyle } from "../ui-utils";
import lensStyles from "./lens.css?inline";

class GravitationalLens {
	private enabled: boolean = false;
	private svgElement: SVGSVGElement | null = null;
	private lensDiv: HTMLDivElement | null = null;
	private filterId = "gravitational-lens-filter";

	private handleMouseMoveBound: (e: MouseEvent) => void;
	private handleTouchMoveBound: (e: TouchEvent) => void;

	constructor() {
		this.handleMouseMoveBound = this.handleMouseMove.bind(this);
		this.handleTouchMoveBound = this.handleTouchMove.bind(this);
	}

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

	public toggle() {
		if (this.enabled) {
			this.disable();
		} else {
			this.enable();
		}
	}

	public enable() {
		if (this.enabled) return;
		this.init();
		this.enabled = true;
		if (this.lensDiv) this.lensDiv.style.display = "block";
		window.addEventListener("mousemove", this.handleMouseMoveBound);
		window.addEventListener("touchmove", this.handleTouchMoveBound);
		showToast("🔭GravitationalLens: Enabled!");
	}

	public disable() {
		if (!this.enabled) return;
		this.enabled = false;
		if (this.lensDiv) this.lensDiv.style.display = "none";
		window.removeEventListener("mousemove", this.handleMouseMoveBound);
		window.removeEventListener("touchmove", this.handleTouchMoveBound);
		showToast("🔭GravitationalLens: Disabled");
	}

	private handleMouseMove(e: MouseEvent) {
		this.updatePosition(e.clientX, e.clientY);
	}

	private handleTouchMove(e: TouchEvent) {
		if (e.touches.length > 0) {
			this.updatePosition(e.touches[0].clientX, e.touches[0].clientY);
		}
	}

	private updatePosition(x: number, y: number) {
		if (this.lensDiv) {
			this.lensDiv.style.left = `${x}px`;
			this.lensDiv.style.top = `${y}px`;
		}
	}

	public destroy() {
		this.disable();
		this.svgElement?.remove();
		this.lensDiv?.remove();
		this.svgElement = null;
		this.lensDiv = null;
		removeStyle("lens-style");
	}
}

export const lensMode = new GravitationalLens();
