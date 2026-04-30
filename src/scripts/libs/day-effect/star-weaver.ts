interface ConstellationTemplate {
	name: string;
	stars: { x: number; y: number }[]; // 0 to 1 range
}

const CONSTELLATIONS: ConstellationTemplate[] = [
	{
		name: "Cassiopeia",
		stars: [
			{ x: 0.3, y: 0.2 },
			{ x: 0.4, y: 0.4 },
			{ x: 0.5, y: 0.3 },
			{ x: 0.6, y: 0.5 },
			{ x: 0.7, y: 0.3 },
		],
	},
	{
		name: "Big Dipper",
		stars: [
			{ x: 0.2, y: 0.5 },
			{ x: 0.3, y: 0.45 },
			{ x: 0.4, y: 0.48 },
			{ x: 0.5, y: 0.55 },
			{ x: 0.5, y: 0.7 },
			{ x: 0.7, y: 0.75 },
			{ x: 0.75, y: 0.6 },
		],
	},
	{
		name: "Summer Triangle",
		stars: [
			{ x: 0.5, y: 0.2 },
			{ x: 0.3, y: 0.6 },
			{ x: 0.7, y: 0.7 },
		],
	},
	{
		name: "Lyra",
		stars: [
			{ x: 0.45, y: 0.25 },
			{ x: 0.55, y: 0.25 },
			{ x: 0.5, y: 0.35 },
			{ x: 0.45, y: 0.45 },
			{ x: 0.55, y: 0.45 },
		],
	},
	{
		name: "Cygnus",
		stars: [
			{ x: 0.5, y: 0.3 },
			{ x: 0.5, y: 0.5 },
			{ x: 0.5, y: 0.8 },
			{ x: 0.3, y: 0.5 },
			{ x: 0.7, y: 0.5 },
		],
	},
];

class StarWeaver {
	private container: HTMLDivElement | null = null;
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private stars: { x: number; y: number; opacity: number; size: number; templateIdx?: number }[] = [];
	private currentTemplate: ConstellationTemplate | null = null;
	private completedNames: { name: string; x: number; y: number; life: number }[] = [];
	private animationFrameId: number | null = null;
	private clickHandler: ((e: MouseEvent) => void) | null = null;

	public start() {
		if (this.container) return;

		this.container = document.createElement("div");
		this.container.id = "star-weaver-container";
		Object.assign(this.container.style, {
			position: "fixed",
			inset: "0",
			zIndex: "9996",
			pointerEvents: "none",
			backgroundColor: "rgba(0, 0, 20, 0.2)",
			transition: "background-color 2s ease",
		});

		this.canvas = document.createElement("canvas");
		Object.assign(this.canvas.style, {
			position: "absolute",
			inset: "0",
			pointerEvents: "auto",
		});
		this.container.appendChild(this.canvas);
		document.body.appendChild(this.container);

		this.resize();
		this.ctx = this.canvas.getContext("2d");

		this.clickHandler = (e: MouseEvent) => this.addStar(e.clientX, e.clientY);
		this.canvas.addEventListener("mousedown", this.clickHandler);
		window.addEventListener("resize", () => this.resize());

		this.loop();
	}

	private resize() {
		if (this.canvas) {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		}
	}

	private addStar(x: number, y: number) {
		if (!this.currentTemplate) {
			this.currentTemplate = CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)];
		}

		let finalX = x;
		let finalY = y;
		let templateIdx = -1;

		// Snapping logic
		const snapDist = 40;
		for (let i = 0; i < this.currentTemplate.stars.length; i++) {
			const tx = this.currentTemplate.stars[i].x * window.innerWidth;
			const ty = this.currentTemplate.stars[i].y * window.innerHeight;
			const d = Math.hypot(x - tx, y - ty);

			if (d < snapDist) {
				// Check if already filled
				if (!this.stars.some((s) => s.templateIdx === i)) {
					finalX = tx;
					finalY = ty;
					templateIdx = i;
					break;
				}
			}
		}

		this.stars.push({
			x: finalX,
			y: finalY,
			opacity: 1,
			size: templateIdx !== -1 ? 5 : Math.random() * 2 + 1,
			templateIdx: templateIdx !== -1 ? templateIdx : undefined,
		});

		if (this.stars.length > 100) this.stars.shift();

		// Check completion
		if (this.currentTemplate) {
			const filledCount = this.stars.filter((s) => s.templateIdx !== undefined).length;
			if (filledCount === this.currentTemplate.stars.length) {
				this.completedNames.push({
					name: this.currentTemplate.name,
					x: finalX,
					y: finalY - 40,
					life: 1,
				});
				this.currentTemplate = null; // Pick new one on next click
				// Fade out non-template stars
				this.stars = this.stars.filter((s) => s.templateIdx !== undefined);
			}
		}
	}

	private loop() {
		if (!this.ctx || !this.canvas) return;

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw hints for current template
		if (this.currentTemplate) {
			this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
			this.currentTemplate.stars.forEach((s) => {
				const tx = s.x * window.innerWidth;
				const ty = s.y * window.innerHeight;
				this.ctx!.beginPath();
				this.ctx!.arc(tx, ty, 3, 0, Math.PI * 2);
				this.ctx!.fill();
			});
		}

		// Draw connections
		this.ctx.beginPath();
		this.ctx.strokeStyle = "rgba(100, 150, 255, 0.3)";
		this.ctx.lineWidth = 1;
		for (let i = 0; i < this.stars.length; i++) {
			for (let j = i + 1; j < this.stars.length; j++) {
				const starA = this.stars[i];
				const starB = this.stars[j];
				const d = Math.hypot(starA.x - starB.x, starA.y - starB.y);

				// Connect if both are template stars or if they are close
				const bothTemplate = starA.templateIdx !== undefined && starB.templateIdx !== undefined;
				const connectDist = bothTemplate ? 300 : 150;

				if (d < connectDist) {
					this.ctx.moveTo(starA.x, starA.y);
					this.ctx.lineTo(starB.x, starB.y);
				}
			}
		}
		this.ctx.stroke();

		// Draw stars
		this.stars.forEach((star) => {
			this.ctx!.beginPath();
			const baseOpacity = star.templateIdx !== undefined ? 0.8 : 0.4;
			const twinkle = Math.abs(Math.sin(Date.now() / 500 + star.x)) * 0.4;
			this.ctx!.fillStyle = `rgba(255, 255, 255, ${baseOpacity + twinkle})`;
			this.ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2);
			this.ctx!.fill();

			if (star.templateIdx !== undefined) {
				this.ctx!.shadowBlur = 10;
				this.ctx!.shadowColor = "white";
				this.ctx!.stroke();
				this.ctx!.shadowBlur = 0;
			}
		});

		// Draw completed names
		this.ctx.font = "bold 20px sans-serif";
		this.ctx.textAlign = "center";
		this.completedNames = this.completedNames.filter((n) => {
			this.ctx!.fillStyle = `rgba(255, 255, 255, ${n.life})`;
			this.ctx!.fillText(n.name, n.x, n.y);
			n.y -= 0.5;
			n.life -= 0.005;
			return n.life > 0;
		});

		this.animationFrameId = requestAnimationFrame(() => this.loop());
	}

	public stop() {
		if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
		if (this.clickHandler && this.canvas) this.canvas.removeEventListener("mousedown", this.clickHandler);
		this.container?.remove();
		this.container = null;
		this.canvas = null;
		this.ctx = null;
		this.stars = [];
	}
}

export const starWeaver = new StarWeaver();
export const startStarWeaver = () => starWeaver.start();
export const stopStarWeaver = () => starWeaver.stop();
