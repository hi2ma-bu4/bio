import Matter from "matter-js";

const { Engine, Runner, Bodies, Composite, Body, Events } = Matter;

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
	private lastScrollY = 0;
	private totalAltitude = 0;
	private isInfiniteMode = false;
	private lastClickTime = 0;
	private animationFrameId: number | null = null;
	private clickHandler: ((e: MouseEvent) => void) | null = null;
	private scrollHandler: (() => void) | null = null;

	public start() {
		if (this.container) return;
		this.lastScrollY = window.scrollY;

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

		this.scrollHandler = () => this.syncOnScroll();
		window.addEventListener("scroll", this.scrollHandler);
	}

	private initPhysics() {
		this.engine = Engine.create();
		this.engine.gravity.y = 1.0;

		this.runner = Runner.create();
		Runner.run(this.runner, this.engine);

		const width = window.innerWidth;
		const height = window.innerHeight;

		this.ground = Bodies.rectangle(width / 2, height + 100, width * 5, 200, { isStatic: true, label: "ground", friction: 0.5 });
		this.leftWall = Bodies.rectangle(-50, height / 2, 100, height * 10, { isStatic: true });
		this.rightWall = Bodies.rectangle(width + 50, height / 2, 100, height * 10, { isStatic: true });

		Composite.add(this.engine.world, [this.ground, this.leftWall, this.rightWall]);

		Events.on(this.engine, "collisionStart", (event) => {
			event.pairs.forEach((pair) => {
				const labels = [pair.bodyA.label, pair.bodyB.label];
				if (labels.includes("rabbit") && (labels.includes("cloud") || labels.includes("platform") || labels.includes("ground"))) {
					const rabbitBody = pair.bodyA.label === "rabbit" ? pair.bodyA : pair.bodyB;
					if (rabbitBody.velocity.y > 0) {
						Body.setVelocity(rabbitBody, { x: rabbitBody.velocity.x, y: -16 });
					}
				}
			});
		});
	}

	private spawnRabbit() {
		const width = window.innerWidth;
		const height = window.innerHeight;

		this.rabbit = Bodies.circle(width / 2, height - 100, 20, {
			restitution: 0.3,
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
			transform: "translate(-50%, -50%)",
		});

		this.heightEl = document.createElement("div");
		Object.assign(this.heightEl.style, {
			position: "absolute",
			fontSize: "16px",
			fontWeight: "bold",
			color: "#fff",
			textShadow: "0 0 4px #000, 0 0 4px #000",
			top: "45px",
			left: "50%",
			transform: "translateX(-50%)",
			fontFamily: "sans-serif",
		});
		this.rabbitEl.appendChild(this.heightEl);

		this.container?.appendChild(this.rabbitEl);
	}

	private initPlatforms() {
		const elements = document.querySelectorAll("a, button, h1, h2, .card, p, li, img, span");
		elements.forEach((el) => {
			const rect = el.getBoundingClientRect();
			if (rect.width > 5 && rect.height > 5 && rect.width < window.innerWidth * 0.9) {
				const body = Bodies.rectangle(rect.left + rect.width / 2, rect.top + rect.height / 2, rect.width, rect.height, {
					isStatic: true,
					label: "platform",
				});
				Composite.add(this.engine!.world, body);
				this.platforms.push({ body, element: el });
			}
		});
	}

	private syncOnScroll() {
		const scrollY = window.scrollY;
		const deltaY = scrollY - this.lastScrollY;
		this.lastScrollY = scrollY;

		if (this.isInfiniteMode) return;

		if (this.rabbit) {
			Body.setPosition(this.rabbit, {
				x: this.rabbit.position.x,
				y: this.rabbit.position.y - deltaY,
			});
		}
		this.clouds.forEach((c) => {
			Body.setPosition(c.body, { x: c.body.position.x, y: c.body.position.y - deltaY });
			c.absY -= deltaY;
		});

		this.platforms.forEach((p) => {
			const rect = p.element.getBoundingClientRect();
			Body.setPosition(p.body, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
		});
	}

	private handleClick(e: MouseEvent) {
		if (!this.engine || !this.rabbit) return;
		if ((e.target as HTMLElement).closest("a, button")) return;

		const now = Date.now();
		if (now - this.lastClickTime < 100) return;
		this.lastClickTime = now;

		const x = e.clientX;
		const y = e.clientY;

		const distToRabbit = Math.hypot(x - this.rabbit.position.x, y - this.rabbit.position.y);
		if (distToRabbit < 40) return;

		const cloudBody = Bodies.rectangle(x, y, 80, 20, { isStatic: true, label: "cloud" });
		Composite.add(this.engine.world, cloudBody);

		const cloudEl = document.createElement("div");
		cloudEl.textContent = "☁️";
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

		const cloud = { body: cloudBody, el: cloudEl, absY: y };
		this.clouds.push(cloud);

		const dx = (x - this.rabbit.position.x) * 0.0002;
		Body.applyForce(this.rabbit, this.rabbit.position, {
			x: Math.max(-0.005, Math.min(0.005, dx)),
			y: 0,
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
			const height = window.innerHeight;
			const width = window.innerWidth;

			let shift = 0;
			if (pos.y < height * 0.3) {
				shift = height * 0.3 - pos.y;
			} else if (pos.y > height * 0.7 && this.totalAltitude > 0) {
				shift = height * 0.7 - pos.y;
				if (this.totalAltitude + shift < 0) shift = -this.totalAltitude;
			}

			if (shift !== 0) {
				this.totalAltitude += shift;
				Body.setPosition(this.rabbit, { x: pos.x, y: pos.y + shift });
				this.clouds.forEach((c) => {
					Body.setPosition(c.body, { x: c.body.position.x, y: c.body.position.y + shift });
					c.absY += shift;
				});
			}

			if (this.totalAltitude > 2000 && !this.isInfiniteMode) {
				this.isInfiniteMode = true;
			}

			if (this.isInfiniteMode) {
				const heightAboveThreshold = Math.max(0, this.totalAltitude - 2000);
				const opacity = Math.min(0.4, heightAboveThreshold / 2000);
				this.container.style.backgroundColor = `rgba(0, 0, 30, ${opacity})`;
			} else {
				this.container.style.backgroundColor = "transparent";
				this.isInfiniteMode = false;
			}

			this.rabbitEl.style.left = `${pos.x}px`;
			this.rabbitEl.style.top = `${pos.y}px`;
			this.rabbitEl.style.transform = `translate(-50%, -50%) rotate(${this.rabbit.angle}rad)`;
			this.heightEl.textContent = `${Math.floor(this.totalAltitude / 10)}m`;

			this.clouds.forEach((c) => {
				c.el.style.top = `${c.absY}px`;
			});

			if (this.leftWall) Body.setPosition(this.leftWall, { x: -50, y: pos.y });
			if (this.rightWall) Body.setPosition(this.rightWall, { x: width + 50, y: pos.y });

			if (pos.y > height + 400) {
				Body.setPosition(this.rabbit, { x: width / 2, y: height - 100 });
				Body.setVelocity(this.rabbit, { x: 0, y: 0 });
				if (!this.isInfiniteMode) this.totalAltitude = 0;
			}

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
				this.rabbitEl = null;
				this.heightEl = null;
				this.ground = null;
				this.leftWall = null;
				this.rightWall = null;
				this.platforms = [];
				this.clouds = [];
				this.totalAltitude = 0;
				this.isInfiniteMode = false;
			}, 1000);
		}
	}
}

export const moonJumper = new MoonJumper();
export const startMoonJumper = () => moonJumper.start();
export const stopMoonJumper = () => moonJumper.stop();
