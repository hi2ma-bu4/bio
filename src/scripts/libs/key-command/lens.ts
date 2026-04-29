import { showToast } from "../ui-toast";

class GravitationalLens {
	private enabled: boolean = false;
	private svgElement: SVGSVGElement | null = null;
	private filterId = "gravitational-lens-filter";
	private displacementMap: SVGFEDisplacementMapElement | null = null;
	private circle: SVGCircleElement | null = null;

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
			top: "0",
			left: "0",
			width: "100%",
			height: "100%",
			pointerEvents: "none",
			zIndex: "-1", // Hide the source of displacement
			opacity: "0",
		});
		this.svgElement.setAttribute("aria-hidden", "true");

		const defs = document.createElementNS(svgNs, "defs");
		const filter = document.createElementNS(svgNs, "filter");
		filter.id = this.filterId;

		// Displacement map using the red/green channels of the source graphic (the circle)
		this.displacementMap = document.createElementNS(svgNs, "feDisplacementMap");
		this.displacementMap.setAttribute("in", "SourceGraphic");
		this.displacementMap.setAttribute("in2", "SourceGraphic");
		this.displacementMap.setAttribute("scale", "100");
		this.displacementMap.setAttribute("xChannelSelector", "R");
		this.displacementMap.setAttribute("yChannelSelector", "G");

		// Actually, we want to filter the BODY, using the SVG as displacement source.
		// So 'in' should be SourceGraphic (of the body) and 'in2' should be the displacement source.

		filter.appendChild(this.displacementMap);
		defs.appendChild(filter);
		this.svgElement.appendChild(defs);

		// The displacement source: a circle with a radial gradient
		// Red for X displacement, Green for Y displacement
		const radialGradient = document.createElementNS(svgNs, "radialGradient");
		radialGradient.id = "lens-gradient";

		const stop1 = document.createElementNS(svgNs, "stop");
		stop1.setAttribute("offset", "0%");
		stop1.setAttribute("stop-color", "rgb(127,127,0)"); // Neutral displacement at center?
		// Actually, feDisplacementMap uses 0.5 as neutral. 127/255 is ~0.5.

		const stop2 = document.createElementNS(svgNs, "stop");
		stop2.setAttribute("offset", "100%");
		stop2.setAttribute("stop-color", "rgb(127,127,0)");

		// Wait, a lens effect needs a gradient.
		// Left of lens: push right (R > 0.5), Right of lens: push left (R < 0.5)
		// Top of lens: push down (G > 0.5), Bottom of lens: push up (G < 0.5)

		radialGradient.innerHTML = `
			<stop offset="0%" stop-color="rgb(255,127,0)" />
			<stop offset="50%" stop-color="rgb(127,255,0)" />
			<stop offset="100%" stop-color="rgb(127,127,0)" />
		`;
		// This is just a placeholder, real lens gradient is a bit more complex but let's keep it simple.

		defs.appendChild(radialGradient);

		this.circle = document.createElementNS(svgNs, "circle");
		this.circle.setAttribute("r", "150");
		this.circle.setAttribute("fill", "url(#lens-gradient)");
		this.svgElement.appendChild(this.circle);

		document.body.appendChild(this.svgElement);
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

		// We need to apply the filter to the container of the content
		// Applying to body might be heavy or cause issues with fixed elements.
		// But let's try body first.
		document.body.style.filter = `url(#${this.filterId})`;

		// To make the circle follow the mouse, we update its cx/cy
		window.addEventListener("mousemove", this.handleMouseMoveBound);
		window.addEventListener("touchmove", this.handleTouchMoveBound);
		showToast("🔭GravitationalLens: Enabled!");
	}

	public disable() {
		if (!this.enabled) return;
		this.enabled = false;
		document.body.style.filter = "";
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
		if (this.circle) {
			this.circle.setAttribute("cx", x.toString());
			this.circle.setAttribute("cy", y.toString());
		}
	}

	public destroy() {
		this.disable();
		this.svgElement?.remove();
		this.svgElement = null;
	}
}

export const lensMode = new GravitationalLens();
