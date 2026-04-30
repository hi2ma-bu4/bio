import Matter from "matter-js";

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
	private rabbitEl: HTMLDivElement | null = null;
	private heightEl: HTMLDivElement | null = null;
	private ground: Matter.Body | null = null;
	private leftWall: Matter.Body | null = null;
	private rightWall: Matter.Body | null = null;
	private platforms: Platform[] = [];
	private clouds: { body: Matter.Body; el: HTMLDivElement; absY: number }[] = [];
	private gameShiftY = 0; // Camera shift for climbing above page
	private lastClickTime = 0;
	private isInfiniteMode = false;
	private animationFrameId: number | null = null;
	private clickHandler: ((e: MouseEvent) => void) | null = null;

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
			transition: "background 1s ease",
			backgroundColor: "transparent",
		});
		document.body.appendChild(this.container);

		this.initPhysics();
		this.spawnRabbit();
		this.initPlatforms();
		this.startLoop();

		this.clickHandler = (e: MouseEvent) => this.handleClick(e);
		window.addEventListener("mousedown", this.clickHandler);
	}

	private initPhysics() {
		this.engine = Engine.create();
		this.engine.gravity.y = 1.0;

		this.runner = Runner.create();
		Runner.run(this.runner, this.engine);

		const width = window.innerWidth;
		const height = window.innerHeight;
		const scrollY = window.scrollY;

		// Initial floor and walls in absolute coordinates
		this.ground = Bodies.rectangle(width / 2, scrollY + height + 100, width * 5, 200, { isStatic: true, label: "ground" });
		this.leftWall = Bodies.rectangle(-50, scrollY + height / 2, 100, height * 10, { isStatic: true });
		this.rightWall = Bodies.rectangle(width + 50, scrollY + height / 2, 100, height * 10, { isStatic: true });

		Composite.add(this.engine.world, [this.ground, this.leftWall, this.rightWall]);
	}

	private spawnRabbit() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const scrollY = window.scrollY;

		this.rabbit = Bodies.circle(width / 2, scrollY + height - 150, 20, {
			restitution: 0.4,
			friction: 0.1,
			label: "rabbit",
		});
		Composite.add(this.engine!.world, this.rabbit);

		this.rabbitEl = document.createElement("div");
		this.rabbitEl.id = "rabbit-element";
		this.rabbitEl.textContent = "🐇";
		Object.assign(this.rabbitEl.style, {
			position: "absolute",
			fontSize: "40px",
			pointerEvents: "none",
			userSelect: "none",
			zIndex: "1000",
			lineHeight: "1",
		});

		this.heightEl = document.createElement("div");
		Object.assign(this.heightEl.style, {
			position: "absolute",
			fontSize: "14px",
			fontWeight: "bold",
			color: "#fff",
			textShadow: "0 0 4px #000, 0 0 4px #000",
			top: "40px",
			left: "50%",
			transform: "translateX(-50%)",
			fontFamily: "monospace",
		});
		this.rabbitEl.appendChild(this.heightEl);

		this.container?.appendChild(this.rabbitEl);
	}

	private initPlatforms() {
		const elements = document.querySelectorAll("a, button, h1, h2, .card, p, li, img, span");
		const scrollY = window.scrollY;
		elements.forEach((el) => {
			const rect = el.getBoundingClientRect();
			if (rect.width > 10 && rect.height > 10 && rect.width < window.innerWidth * 0.9) {
				const body = Bodies.rectangle(rect.left + rect.width / 2, rect.top + rect.height / 2 + scrollY, rect.width, rect.height, { isStatic: true, label: "platform" });
				Composite.add(this.engine!.world, body);
				this.platforms.push({ body, element: el });
			}
		});
	}

	private handleClick(e: MouseEvent) {
		if (!this.engine || !this.rabbit) return;
		if ((e.target as HTMLElement).closest("a, button")) return;

		const now = Date.now();
		if (now - this.lastClickTime < 150) return;
		this.lastClickTime = now;

		if (this.rabbit.velocity.y < -15) return;

		const scrollY = window.scrollY;
		const x = e.clientX;
		const y = e.clientY + scrollY - this.gameShiftY;

		const cloudBody = Bodies.rectangle(x, y, 80, 20, { isStatic: true, label: "cloud" });
		Composite.add(this.engine.world, cloudBody);

		const cloudEl = document.createElement("div");
		cloudEl.textContent = "☁️";
		Object.assign(cloudEl.style, {
			position: "absolute",
			left: `${x}px`,
			fontSize: "30px",
			transform: "translate(-50%, -50%)",
			pointerEvents: "none",
			opacity: "0.8",
			transition: "opacity 3s ease-out",
		});
		this.container?.appendChild(cloudEl);

		const cloud = { body: cloudBody, el: cloudEl, absY: y };
		this.clouds.push(cloud);

		Body.applyForce(this.rabbit, this.rabbit.position, {
			x: (x - this.rabbit.position.x) * 0.001,
			y: -0.05,
		});

		setTimeout(() => {
			if (this.engine) {
				Composite.remove(this.engine.world, cloud.body);
				this.clouds = this.clouds.filter((c) => c !== cloud);
			}
			cloud.el.style.opacity = "0";
			setTimeout(() => cloud.el.remove(), 3000);
		}, 5000);
	}

	private startLoop() {
		const update = () => {
			if (!this.rabbit || !this.rabbitEl || !this.container || !this.heightEl) return;

			const pos = this.rabbit.position;
			const scrollY = window.scrollY;
			const height = window.innerHeight;
			const width = window.innerWidth;

			// Sync boundaries to current viewport (absolute coordinates)
			if (this.ground) Body.setPosition(this.ground, { x: width / 2, y: scrollY + height + 100 });
			if (this.leftWall) Body.setPosition(this.leftWall, { x: -50, y: pos.y });
			if (this.rightWall) Body.setPosition(this.rightWall, { x: width + 50, y: pos.y });

			// CAMERA LOGIC
			const relativeY = pos.y - scrollY + this.gameShiftY;
			if (relativeY < height * 0.3) {
				this.gameShiftY += height * 0.3 - relativeY;
			} else if (relativeY > height * 0.7 && this.gameShiftY > 0) {
				const fall = relativeY - height * 0.7;
				this.gameShiftY = Math.max(0, this.gameShiftY - fall);
			}

			// Visual positioning
			this.rabbitEl.style.left = `${pos.x}px`;
			this.rabbitEl.style.top = `${pos.y - scrollY + this.gameShiftY}px`;
			this.rabbitEl.style.transform = `translate(-50%, -50%) rotate(${this.rabbit.angle}rad)`;

			const altitudeM = Math.max(0, Math.floor((this.gameShiftY + (scrollY + height - pos.y - 150)) / 10));
			this.heightEl.textContent = `${altitudeM}m`;

			this.clouds.forEach((c) => {
				c.el.style.top = `${c.absY - scrollY + this.gameShiftY}px`;
			});

			const spaceThreshold = 2000;
			if (this.gameShiftY > spaceThreshold) {
				const opacity = Math.min(0.6, (this.gameShiftY - spaceThreshold) / 2000);
				this.container.style.backgroundColor = `rgba(0, 0, 40, ${opacity})`;
				this.isInfiniteMode = true;
			} else {
				this.container.style.backgroundColor = "transparent";
				this.isInfiniteMode = false;
			}

			// Respawn if glitch
			if (pos.y > scrollY + height + 500) {
				Body.setPosition(this.rabbit, { x: width / 2, y: scrollY + height - 150 });
				Body.setVelocity(this.rabbit, { x: 0, y: 0 });
			}

			this.animationFrameId = requestAnimationFrame(update);
		};
		update();
	}

	public stop() {
		if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
		if (this.runner) Runner.stop(this.runner);
		if (this.clickHandler) window.removeEventListener("mousedown", this.clickHandler);

		if (this.container) {
			this.container.style.opacity = "0";
			setTimeout(() => {
				this.container?.remove();
				this.container = null;
				this.engine = null;
				this.runner = null;
				this.rabbit = null;
				this.rabbitEl = null;
				this.heightEl = null;
				this.ground = null;
				this.leftWall = null;
				this.rightWall = null;
				this.platforms = [];
				this.clouds = [];
				this.gameShiftY = 0;
				this.isInfiniteMode = false;
			}, 1000);
		}
	}
}

export const moonJumper = new MoonJumper();
export const startMoonJumper = () => moonJumper.start();
export const stopMoonJumper = () => moonJumper.stop();
