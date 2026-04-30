import { showToast } from "../ui-toast";

interface Point {
	x: number;
	y: number;
	filled: boolean;
	element?: HTMLDivElement;
}

interface Constellation {
	name: string;
	points: { x: number; y: number }[];
	lines: [number, number][];
}

const CONSTELLATIONS: Constellation[] = [
	{
		name: "Aries",
		points: [
			{ x: 20, y: 50 },
			{ x: 35, y: 40 },
			{ x: 45, y: 45 },
			{ x: 50, y: 55 },
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
		],
	},
	{
		name: "Taurus",
		points: [
			{ x: 70, y: 30 },
			{ x: 60, y: 40 },
			{ x: 50, y: 45 },
			{ x: 40, y: 40 },
			{ x: 45, y: 55 },
			{ x: 55, y: 65 },
			{ x: 30, y: 35 },
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[2, 4],
			[4, 5],
			[3, 6],
		],
	},
	{
		name: "Gemini",
		points: [
			{ x: 30, y: 30 },
			{ x: 40, y: 35 },
			{ x: 50, y: 40 },
			{ x: 35, y: 50 },
			{ x: 45, y: 55 },
			{ x: 55, y: 60 },
		],
		lines: [
			[0, 1],
			[1, 2],
			[3, 4],
			[4, 5],
			[0, 3],
			[2, 5],
		],
	},
	{
		name: "Cancer",
		points: [
			{ x: 50, y: 30 },
			{ x: 50, y: 45 },
			{ x: 40, y: 60 },
			{ x: 60, y: 60 },
		],
		lines: [
			[0, 1],
			[1, 2],
			[1, 3],
		],
	},
	{
		name: "Leo",
		points: [
			{ x: 70, y: 50 },
			{ x: 60, y: 55 },
			{ x: 50, y: 50 },
			{ x: 45, y: 40 },
			{ x: 50, y: 30 },
			{ x: 60, y: 25 },
			{ x: 40, y: 60 },
			{ x: 30, y: 55 },
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[2, 6],
			[6, 7],
		],
	},
	{
		name: "Virgo",
		points: [
			{ x: 30, y: 40 },
			{ x: 40, y: 45 },
			{ x: 50, y: 40 },
			{ x: 60, y: 45 },
			{ x: 50, y: 55 },
			{ x: 55, y: 70 },
			{ x: 45, y: 30 },
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[2, 4],
			[4, 5],
			[2, 6],
		],
	},
	{
		name: "Libra",
		points: [
			{ x: 40, y: 40 },
			{ x: 50, y: 30 },
			{ x: 60, y: 45 },
			{ x: 50, y: 60 },
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
		],
	},
	{
		name: "Scorpio",
		points: [
			{ x: 30, y: 30 },
			{ x: 40, y: 35 },
			{ x: 50, y: 40 },
			{ x: 55, y: 55 },
			{ x: 50, y: 70 },
			{ x: 40, y: 75 },
			{ x: 30, y: 70 },
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, 6],
		],
	},
	{
		name: "Sagittarius",
		points: [
			{ x: 40, y: 50 },
			{ x: 50, y: 45 },
			{ x: 60, y: 50 },
			{ x: 55, y: 65 },
			{ x: 45, y: 65 },
			{ x: 50, y: 30 },
			{ x: 65, y: 35 },
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 0],
			[1, 5],
			[2, 6],
		],
	},
	{
		name: "Capricorn",
		points: [
			{ x: 30, y: 40 },
			{ x: 45, y: 35 },
			{ x: 65, y: 40 },
			{ x: 60, y: 60 },
			{ x: 45, y: 65 },
			{ x: 35, y: 55 },
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, 0],
		],
	},
	{
		name: "Aquarius",
		points: [
			{ x: 30, y: 30 },
			{ x: 40, y: 35 },
			{ x: 45, y: 45 },
			{ x: 55, y: 40 },
			{ x: 65, y: 45 },
			{ x: 60, y: 55 },
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
		],
	},
	{
		name: "Pisces",
		points: [
			{ x: 20, y: 30 },
			{ x: 30, y: 40 },
			{ x: 45, y: 45 },
			{ x: 55, y: 55 },
			{ x: 70, y: 60 },
			{ x: 60, y: 40 },
			{ x: 55, y: 25 },
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[2, 5],
			[5, 6],
		],
	},
];

class StarWeaver {
	private container: HTMLDivElement | null = null;
	private svg: SVGSVGElement | null = null;
	private currentConstellation: Constellation | null = null;
	private targetPoints: Point[] = [];
	private activeStars: HTMLDivElement[] = [];
	private isCompleted = false;
	private spawnInterval: number | null = null;

	public start() {
		if (this.container) return;

		this.container = document.createElement("div");
		this.container.id = "star-weaver-container";
		Object.assign(this.container.style, {
			position: "fixed",
			inset: "0",
			pointerEvents: "none",
			zIndex: "9998",
			overflow: "hidden",
		});
		document.body.appendChild(this.container);

		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		Object.assign(this.svg.style, {
			position: "absolute",
			inset: "0",
			width: "100%",
			height: "100%",
		});
		this.container.appendChild(this.svg);

		this.initConstellation();
		this.startSpawning();
	}

	private initConstellation() {
		this.currentConstellation = CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)];
		this.targetPoints = this.currentConstellation.points.map((p) => ({ ...p, filled: false }));

		// Draw guide lines
		this.currentConstellation.lines.forEach(([i, j]) => {
			const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line.setAttribute("x1", `${this.targetPoints[i].x}%`);
			line.setAttribute("y1", `${this.targetPoints[i].y}%`);
			line.setAttribute("x2", `${this.targetPoints[j].x}%`);
			line.setAttribute("y2", `${this.targetPoints[j].y}%`);
			line.setAttribute("stroke", "rgba(255, 255, 255, 0.1)");
			line.setAttribute("stroke-width", "1");
			this.svg?.appendChild(line);
		});

		// Draw guide points
		this.targetPoints.forEach((p) => {
			const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			circle.setAttribute("cx", `${p.x}%`);
			circle.setAttribute("cy", `${p.y}%`);
			circle.setAttribute("r", "3");
			circle.setAttribute("fill", "rgba(255, 255, 255, 0.2)");
			this.svg?.appendChild(circle);
		});
	}

	private startSpawning() {
		this.spawnInterval = window.setInterval(() => {
			if (this.isCompleted) return;
			this.spawnStar();
		}, 1000);
	}

	private spawnStar() {
		const star = document.createElement("div");
		const size = Math.random() * 10 + 10;
		const startX = Math.random() * 100;

		Object.assign(star.style, {
			position: "absolute",
			left: `${startX}%`,
			top: "-20px",
			width: `${size}px`,
			height: `${size}px`,
			backgroundColor: "#fff",
			clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
			boxShadow: "0 0 10px #fff",
			cursor: "pointer",
			pointerEvents: "auto",
			transition: "top 10s linear, left 1s ease-out, transform 0.5s ease-out",
		});

		star.addEventListener("click", () => this.catchStar(star));
		this.container?.appendChild(star);
		this.activeStars.push(star);

		requestAnimationFrame(() => {
			star.style.top = "110vh";
		});

		setTimeout(() => {
			if (star.parentElement) {
				star.remove();
				this.activeStars = this.activeStars.filter((s) => s !== star);
			}
		}, 10000);
	}

	private catchStar(star: HTMLDivElement) {
		if (this.isCompleted) return;

		const starRect = star.getBoundingClientRect();
		const starX = ((starRect.left + starRect.width / 2) / window.innerWidth) * 100;
		const starY = ((starRect.top + starRect.height / 2) / window.innerHeight) * 100;

		// Find closest empty point
		let closestDist = Infinity;
		let closestPoint: Point | null = null;

		this.targetPoints.forEach((p) => {
			if (p.filled) return;
			const dx = p.x - starX;
			const dy = p.y - starY;
			const dist = dx * dx + dy * dy;
			if (dist < closestDist) {
				closestDist = dist;
				closestPoint = p;
			}
		});

		if (closestPoint) {
			const p = closestPoint as Point;
			p.filled = true;
			p.element = star;

			star.style.transition = "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
			star.style.left = `${p.x}%`;
			star.style.top = `${p.y}%`;
			star.style.transform = "translate(-50%, -50%) scale(1.2)";
			star.style.boxShadow = "0 0 20px #fff, 0 0 40px #00f";
			star.style.pointerEvents = "none";

			this.checkCompletion();
		}
	}

	private checkCompletion() {
		if (this.targetPoints.every((p) => p.filled)) {
			this.isCompleted = true;
			this.completeEffect();
		}
	}

	private completeEffect() {
		showToast(`🌠 Constellation ${this.currentConstellation?.name} Completed!`);

		// Brighten lines
		const lines = this.svg?.querySelectorAll("line");
		lines?.forEach((line) => {
			line.setAttribute("stroke", "rgba(255, 255, 255, 0.8)");
			line.setAttribute("stroke-width", "2");
			line.style.filter = "drop-shadow(0 0 5px #fff)";
			line.style.transition = "all 1s ease-out";
		});

		// Create Milky Way effect
		const milkyWay = document.createElement("div");
		Object.assign(milkyWay.style, {
			position: "absolute",
			inset: "0",
			background: "radial-gradient(ellipse at center, rgba(100, 100, 255, 0.2) 0%, transparent 70%)",
			opacity: "0",
			transition: "opacity 2s ease-in",
		});
		this.container?.appendChild(milkyWay);
		requestAnimationFrame(() => (milkyWay.style.opacity = "1"));

		setTimeout(() => this.stop(), 5000);
	}

	public stop() {
		if (this.spawnInterval) clearInterval(this.spawnInterval);
		this.spawnInterval = null;

		if (this.container) {
			this.container.style.transition = "opacity 1s ease-out";
			this.container.style.opacity = "0";
			setTimeout(() => {
				this.container?.remove();
				this.container = null;
				this.svg = null;
				this.activeStars = [];
				this.isCompleted = false;
			}, 1000);
		}
	}
}

export const starWeaver = new StarWeaver();
export const startStarWeaver = () => starWeaver.start();
export const stopStarWeaver = () => starWeaver.stop();
