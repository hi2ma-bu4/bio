import Matter from "matter-js";
import { showToast } from "../ui-toast";

const { Engine, Runner, Bodies, Composite, Body } = Matter;

interface Platform {
	body: Matter.Body;
	element: Element;
}

class MoonJumper {
	private engine: Matter.Engine | null = null;
	private runner: Matter.Runner | null = null;
	private container: HTMLDivElement | null = null;
	private rabbit: Matter.Body | null = null;
	private platforms: Platform[] = [];
	private clouds: Matter.Body[] = [];
	private isInfiniteMode = false;
	private cameraY = 0;
	private animationFrameId: number | null = null;
	private clickHandler: ((e: MouseEvent) => void) | null = null;
	private scrollHandler: (() => void) | null = null;

	public start() {
		if (this.container) return;

		this.container = document.createElement("div");
		this.container.id = "moon-jumper-container";
		Object.assign(this.container.style, {
			position: "fixed",
			inset: "0",
			zIndex: "9997",
			pointerEvents: "none",
			overflow: "hidden",
			transition: "background 2s ease",
		});
		document.body.appendChild(this.container);

		this.initPhysics();
		this.spawnRabbit();
		this.createInitialPlatforms();
		this.startLoop();

		this.clickHandler = (e: MouseEvent) => this.handleClick(e);
		window.addEventListener("mousedown", this.clickHandler);

		this.scrollHandler = () => this.syncPlatforms();
		window.addEventListener("scroll", this.scrollHandler);
	}

	private initPhysics() {
		this.engine = Engine.create();
		this.runner = Runner.create();
		Runner.run(this.runner, this.engine);

		const width = window.innerWidth;
		const scrollY = window.scrollY;
		const ground = Bodies.rectangle(width / 2, scrollY + window.innerHeight + 10, width, 20, { isStatic: true });
		const leftWall = Bodies.rectangle(-10, window.innerHeight / 2, 20, window.innerHeight * 1000, { isStatic: true });
		const rightWall = Bodies.rectangle(width + 10, window.innerHeight / 2, 20, window.innerHeight * 1000, { isStatic: true });

		Composite.add(this.engine.world, [ground, leftWall, rightWall]);
	}

	private spawnRabbit() {
		const x = window.innerWidth / 2;
		const y = window.scrollY + window.innerHeight - 100;
		this.rabbit = Bodies.circle(x, y, 15, {
			restitution: 0.8,
			friction: 0.01,
			label: "rabbit",
		});
		Composite.add(this.engine!.world, this.rabbit);

		const rabbitEl = document.createElement("div");
		rabbitEl.id = "rabbit-element";
		rabbitEl.textContent = "🐇";
		Object.assign(rabbitEl.style, {
			position: "absolute",
			fontSize: "30px",
			pointerEvents: "none",
			userSelect: "none",
			zIndex: "10",
		});
		this.container?.appendChild(rabbitEl);
	}

	private createInitialPlatforms() {
		const elements = document.querySelectorAll("a, button, h1, h2, section, .card");
		elements.forEach((el) => {
			const rect = el.getBoundingClientRect();
			if (rect.width > 5 && rect.height > 5) {
				const platform = Bodies.rectangle(rect.left + rect.width / 2, rect.top + rect.height / 2 + window.scrollY, rect.width, rect.height, {
					isStatic: true,
					label: "platform",
				});
				Composite.add(this.engine!.world, platform);
				this.platforms.push({ body: platform, element: el });
			}
		});
	}

	private syncPlatforms() {
		if (!this.isInfiniteMode) {
			this.platforms.forEach((p) => {
				const rect = p.element.getBoundingClientRect();
				Body.setPosition(p.body, {
					x: rect.left + rect.width / 2,
					y: rect.top + rect.height / 2 + window.scrollY,
				});
			});
		}
	}

	private handleClick(e: MouseEvent) {
		if (!this.engine || !this.rabbit) return;
		if ((e.target as HTMLElement).closest("a, button")) return;

		const x = e.clientX;
		const y = e.clientY + this.cameraY + window.scrollY;

		const cloud = Bodies.rectangle(x, y, 80, 20, {
			isStatic: true,
			label: "cloud",
		});

		Composite.add(this.engine.world, cloud);
		this.clouds.push(cloud);

		const cloudEl = document.createElement("div");
		cloudEl.textContent = "☁️";
		cloudEl.className = "cloud-element";
		Object.assign(cloudEl.style, {
			position: "absolute",
			left: `${x}px`,
			top: `${y}px`,
			fontSize: "30px",
			transform: "translate(-50%, -50%)",
			pointerEvents: "none",
			opacity: "0.8",
			transition: "opacity 3s ease-out",
		});
		this.container?.appendChild(cloudEl);

		Body.applyForce(this.rabbit, this.rabbit.position, {
			x: (x - this.rabbit.position.x) * 0.0005,
			y: -0.025,
		});

		setTimeout(() => {
			Composite.remove(this.engine!.world, cloud);
			this.clouds = this.clouds.filter((c) => c !== cloud);
			cloudEl.style.opacity = "0";
			setTimeout(() => cloudEl.remove(), 3000);
		}, 5000);
	}

	private startLoop() {
		const update = () => {
			if (!this.rabbit || !this.container) return;

			const rabbitY = this.rabbit.position.y;
			const rabbitX = this.rabbit.position.x;
			const scrollY = window.scrollY;

			if (rabbitY < window.innerHeight / 2 + this.cameraY + scrollY) {
				this.cameraY = rabbitY - window.innerHeight / 2 - scrollY;
			}

			const rabbitEl = document.getElementById("rabbit-element");
			if (rabbitEl) {
				rabbitEl.style.left = `${rabbitX}px`;
				rabbitEl.style.top = `${rabbitY - this.cameraY - scrollY}px`;
				rabbitEl.style.transform = `translate(-50%, -50%) rotate(${this.rabbit.angle}rad)`;
			}

			const height = -this.cameraY;
			if (height > 1000 && !this.isInfiniteMode) {
				this.isInfiniteMode = true;
				showToast("🚀 大気圏突入！さらに上を目指せ！");
			}

			if (this.isInfiniteMode) {
				const blue = Math.max(0, 50 - height / 100);
				const dark = Math.min(10, height / 1000);
				this.container.style.backgroundColor = `rgba(0, 0, ${blue}, ${dark / 10})`;
			}

			this.container.querySelectorAll(".cloud-element").forEach((child) => {
				const el = child as HTMLElement;
				if (!el.dataset.origY) el.dataset.origY = el.style.top;
				const origY = parseFloat(el.dataset.origY);
				el.style.top = `${origY - this.cameraY - scrollY}px`;
			});

			this.animationFrameId = requestAnimationFrame(update);
		};
		update();
	}

	public stop() {
		if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
		if (this.runner) Runner.stop(this.runner);
		if (this.clickHandler) window.removeEventListener("mousedown", this.clickHandler);
		if (this.scrollHandler) window.removeEventListener("scroll", this.scrollHandler);

		if (this.container) {
			this.container.style.opacity = "0";
			setTimeout(() => {
				this.container?.remove();
				this.container = null;
				this.engine = null;
				this.runner = null;
				this.rabbit = null;
				this.platforms = [];
				this.clouds = [];
				this.cameraY = 0;
				this.isInfiniteMode = false;
			}, 1000);
		}
	}
}

export const moonJumper = new MoonJumper();
export const startMoonJumper = () => moonJumper.start();
export const stopMoonJumper = () => moonJumper.stop();
