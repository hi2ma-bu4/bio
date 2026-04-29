import { showToast } from "../ui-toast";

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

		const svgNs = "http://www.w3.org/2000/svg";
		this.svgElement = document.createElementNS(svgNs, "svg");
		Object.assign(this.svgElement.style, {
			position: "fixed",
			width: "0",
			height: "0",
			pointerEvents: "none",
			visibility: "hidden",
		});
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
		Object.assign(this.lensDiv.style, {
			position: "fixed",
			width: "250px",
			height: "250px",
			borderRadius: "50%",
			pointerEvents: "none",
			zIndex: "9999",
			backdropFilter: `url(#${this.filterId})`,
			WebkitBackdropFilter: `url(#${this.filterId})`,
			left: "0",
			top: "0",
			transform: "translate(-50%, -50%)",
			display: "none",
			border: "1px solid rgba(0, 166, 244, 0.4)",
			boxShadow: "0 0 30px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.2)",
		});
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
	}
}

export const lensMode = new GravitationalLens();
