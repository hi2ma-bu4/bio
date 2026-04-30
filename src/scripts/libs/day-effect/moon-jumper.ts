import Matter from "matter-js";

const { Engine, Runner, Bodies, Composite, Body, Events } = Matter;

interface Platform {
	body: Matter.Body;
	element: Element;
	originalY: number;
	originalX: number;
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
	private clouds: { body: Matter.Body; el: HTMLDivElement }[] = [];
	private stars: { el: HTMLDivElement; x: number; y: number; parallax: number; opacity: number }[] = [];
	private isInfiniteMode = false;
	private originalTheme: "light" | "dark" = "light";
	private lastClickTime = 0;
	private animationFrameId: number | null = null;
	private clickHandler: ((e: MouseEvent) => void) | null = null;
	private resizeHandler: (() => void) | null = null;
	private scrollLockHandler: ((e: Event) => void) | null = null;

	public async start() {
		if (this.container) return;

		this.originalTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";

		// 1. Scroll to bottom
		window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
		// Wait for scroll
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// 2. Lock scroll
		this.lockScroll();

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

		this.resizeHandler = () => this.handleResize();
		window.addEventListener("resize", this.resizeHandler);
	}

	private lockScroll() {
		document.body.style.overflow = "hidden";
		this.scrollLockHandler = (e: Event) => {
			if (this.container) {
				e.preventDefault();
			}
		};
		window.addEventListener("wheel", this.scrollLockHandler, { passive: false });
		window.addEventListener("touchmove", this.scrollLockHandler, { passive: false });
	}

	private unlockScroll() {
		document.body.style.overflow = "";
		if (this.scrollLockHandler) {
			window.removeEventListener("wheel", this.scrollLockHandler);
			window.removeEventListener("touchmove", this.scrollLockHandler);
		}
	}

	private initPhysics() {
		this.engine = Engine.create();
		this.engine.gravity.y = 1.2;

		this.runner = Runner.create();
		Runner.run(this.runner, this.engine);

		const width = window.innerWidth;
		const docHeight = document.body.scrollHeight;

		this.ground = Bodies.rectangle(width / 2, docHeight + 50, width * 5, 100, {
			isStatic: true,
			label: "ground",
			friction: 0.5,
		});

		// Walls will be moved to follow viewport in the loop for space mode
		this.leftWall = Bodies.rectangle(-50, docHeight / 2, 100, docHeight * 10, { isStatic: true });
		this.rightWall = Bodies.rectangle(width + 50, docHeight / 2, 100, docHeight * 10, { isStatic: true });

		Composite.add(this.engine.world, [this.ground, this.leftWall, this.rightWall]);

		Events.on(this.engine, "collisionStart", (event) => {
			event.pairs.forEach((pair) => {
				const labels = [pair.bodyA.label, pair.bodyB.label];
				if (labels.includes("rabbit") && (labels.includes("cloud") || labels.includes("platform") || labels.includes("ground"))) {
					const rabbitBody = pair.bodyA.label === "rabbit" ? pair.bodyA : pair.bodyB;
					if (rabbitBody.velocity.y > 0) {
						// Random horizontal nudge on jump
						const jumpForce = -18;
						const nudge = (Math.random() - 0.5) * 6;
						Body.setVelocity(rabbitBody, { x: rabbitBody.velocity.x + nudge, y: jumpForce });
					}
				}
			});
		});
	}

	private spawnRabbit() {
		const width = window.innerWidth;
		const docHeight = document.body.scrollHeight;

		this.rabbit = Bodies.circle(width / 2, docHeight - 100, 20, {
			restitution: 0.2,
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
			fontSize: "14px",
			fontWeight: "bold",
			color: "#fff",
			textShadow: "0 0 4px #000",
			top: "40px",
			left: "50%",
			transform: "translateX(-50%)",
			whiteSpace: "nowrap",
		});
		this.rabbitEl.appendChild(this.heightEl);

		this.container?.appendChild(this.rabbitEl);
	}

	private initPlatforms() {
		const elements = Array.from(document.querySelectorAll("a, button, h1, h2, h3, .card, p, li, img, span, div.project-card"));
		const currentScroll = window.scrollY;
		const processedRects: DOMRect[] = [];

		elements.forEach((el) => {
			const style = window.getComputedStyle(el);
			if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return;

			// Check if el or any ancestor is fixed/sticky
			let parent: Element | null = el;
			let isFixed = false;
			while (parent && parent !== document.body) {
				const pStyle = window.getComputedStyle(parent);
				if (pStyle.position === "fixed" || pStyle.position === "sticky") {
					isFixed = true;
					break;
				}
				parent = parent.parentElement;
			}
			if (isFixed) return;

			const hasText = Array.from(el.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
			const isImage = el.tagName === "IMG";
			// If it doesn't have direct text and isn't an image, skip unless it's a known container
			if (!hasText && !isImage && !el.classList.contains("card") && !el.classList.contains("project-card")) return;

			const rect = el.getBoundingClientRect();
			if (rect.width < 10 || rect.height < 10) return;

			// Avoid overlapping with already processed platforms
			const isOverlapping = processedRects.some((r) => rect.left >= r.left && rect.right <= r.right && rect.top >= r.top && rect.bottom <= r.bottom);
			if (isOverlapping) return;

			const absY = rect.top + currentScroll;
			const absX = rect.left + rect.width / 2;
			const body = Bodies.rectangle(absX, absY + rect.height / 2, rect.width, rect.height, {
				isStatic: true,
				label: "platform",
				friction: 0.5,
			});
			Composite.add(this.engine!.world, body);
			this.platforms.push({ body, element: el, originalY: absY, originalX: absX });
			processedRects.push(rect);
		});
	}

	private handleClick(e: MouseEvent) {
		if (!this.engine || !this.rabbit) return;
		if ((e.target as HTMLElement).closest("a, button")) return;

		const now = Date.now();
		// Anti-spam: 300ms cooldown
		if (now - this.lastClickTime < 300) return;
		this.lastClickTime = now;

		if (this.clouds.length >= 30) {
			const oldest = this.clouds.shift();
			if (oldest) {
				Composite.remove(this.engine.world, oldest.body);
				oldest.el.remove();
			}
		}

		// Convert viewport click to document coordinates
		const x = e.clientX;
		let y = e.clientY + window.scrollY;

		// If in Space Mode (climbing past document top), adjust y relative to altitude
		const viewportH = window.innerHeight;
		if (this.rabbit && this.rabbit.position.y < viewportH * 0.1) {
			const altitude = viewportH * 0.1 - this.rabbit.position.y;
			y -= altitude;
		}

		const distToRabbit = Math.hypot(x - this.rabbit.position.x, y - this.rabbit.position.y);
		if (distToRabbit < 50) return;

		const cloudBody = Bodies.rectangle(x, y, 80, 20, { isStatic: true, label: "cloud" });
		Composite.add(this.engine.world, cloudBody);

		const cloudEl = document.createElement("div");
		cloudEl.textContent = "☁️";
		Object.assign(cloudEl.style, {
			position: "absolute",
			fontSize: "30px",
			transform: "translate(-50%, -50%)",
			pointerEvents: "none",
			opacity: "0.8",
			transition: "opacity 2s ease",
		});
		this.container?.appendChild(cloudEl);

		const cloud = { body: cloudBody, el: cloudEl };
		this.clouds.push(cloud);

		// Tiny horizontal nudge with some randomness
		const dx = (x - this.rabbit.position.x) * 0.0001 + (Math.random() - 0.5) * 0.005;
		Body.applyForce(this.rabbit, this.rabbit.position, { x: dx, y: 0 });

		setTimeout(() => {
			if (this.engine) {
				Composite.remove(this.engine.world, cloud.body);
				this.clouds = this.clouds.filter((c) => c !== cloud);
			}
			cloud.el.style.opacity = "0";
			setTimeout(() => cloud.el.remove(), 2000);
		}, 8000);
	}

	private handleResize() {
		const width = window.innerWidth;
		if (this.leftWall && this.rightWall) {
			Body.setPosition(this.leftWall, { x: -50, y: this.leftWall.position.y });
			Body.setPosition(this.rightWall, { x: width + 50, y: this.rightWall.position.y });
		}
	}

	private startLoop() {
		const update = () => {
			if (!this.rabbit || !this.rabbitEl || !this.container || !this.heightEl) return;

			const pos = this.rabbit.position;
			const viewportH = window.innerHeight;

			// Camera Logic:
			// In document range, we scroll.
			// Beyond document top (Y < viewportH * 0.5), we need to handle virtual camera.
			// Actually, window.scrollTo(0, negative) doesn't work.

			let targetScrollY = pos.y - viewportH * 0.5;
			if (targetScrollY < 0) {
				targetScrollY = 0;
			}
			window.scrollTo(0, targetScrollY);

			const currentScrollY = window.scrollY;

			// Constraints: Keep rabbit in 10% - 90% of viewport
			// If rabbit is too high in viewport, move camera up (if possible) or push rabbit down.
			// Since we can't scroll above 0, if pos.y < viewportH * 0.1, we have a problem.

			let renderY = pos.y - currentScrollY;

			// Apply viewport constraints
			const minRenderY = viewportH * 0.1;
			const maxRenderY = viewportH * 0.9;

			if (renderY < minRenderY) {
				// Rabbit is above the 10% line.
				// If we are already at scroll 0, we must force rabbit to stay at 10% line visually.
				// This means we are effectively in "Space Mode" where the background moves instead.
				renderY = minRenderY;
			} else if (renderY > maxRenderY && pos.y < document.body.scrollHeight - 100) {
				// Only constrain bottom if we are not at the very start
				renderY = maxRenderY;
			}

			// Space Mode: When rabbit tries to go above the scrollable area
			if (pos.y < viewportH * 0.1) {
				this.isInfiniteMode = true;
				const altitude = viewportH * 0.1 - pos.y;
				const bgOpacity = Math.min(0.9, altitude / 4000);
				this.container.style.backgroundColor = `rgba(0, 0, 20, ${bgOpacity})`;

				const main = document.querySelector("main");
				if (main) {
					main.style.opacity = `${Math.max(0, 1 - altitude / 1500)}`;
				}
				document.documentElement.classList.add("dark");
				this.updateStars(altitude);
			} else {
				this.isInfiniteMode = false;
				this.container.style.backgroundColor = "transparent";
				const main = document.querySelector("main");
				if (main) main.style.opacity = "1";
				this.hideStars();
			}

			// Rendering
			this.rabbitEl.style.left = `${pos.x}px`;
			this.rabbitEl.style.top = `${renderY}px`;
			this.rabbitEl.style.transform = `translate(-50%, -50%) rotate(${this.rabbit.angle}rad)`;

			const displayAltitude = Math.max(0, Math.floor((document.body.scrollHeight - pos.y) / 10));
			if (displayAltitude > 1000) {
				this.heightEl.textContent = `${(displayAltitude / 1000).toFixed(1)}km`;
			} else {
				this.heightEl.textContent = `${displayAltitude}m`;
			}

			this.clouds.forEach((c) => {
				const cRenderY = c.body.position.y - currentScrollY;
				// In space mode, we might need to adjust cloud render Y if we are pinning rabbit
				let finalCRenderY = cRenderY;
				if (pos.y < viewportH * 0.1) {
					finalCRenderY = cRenderY + (viewportH * 0.1 - pos.y);
				}
				c.el.style.left = `${c.body.position.x}px`;
				c.el.style.top = `${finalCRenderY}px`;
			});

			// Update walls to follow rabbit in space mode
			if (this.leftWall && this.rightWall) {
				Body.setPosition(this.leftWall, { x: -50, y: pos.y });
				Body.setPosition(this.rightWall, { x: window.innerWidth + 50, y: pos.y });
			}

			// Bound rabbit to screen width
			if (pos.x < 20) Body.setPosition(this.rabbit, { x: 20, y: pos.y });
			if (pos.x > window.innerWidth - 20) Body.setPosition(this.rabbit, { x: window.innerWidth - 20, y: pos.y });

			// Respawn if glitch
			if (pos.y > document.body.scrollHeight + 500) {
				Body.setPosition(this.rabbit, { x: window.innerWidth / 2, y: document.body.scrollHeight - 100 });
				Body.setVelocity(this.rabbit, { x: 0, y: 0 });
			}

			this.animationFrameId = requestAnimationFrame(update);
		};
		update();
	}

	private updateStars(altitude: number) {
		if (this.stars.length === 0) {
			for (let i = 0; i < 60; i++) {
				const el = document.createElement("div");
				const opacity = Math.random();
				Object.assign(el.style, {
					position: "absolute",
					width: Math.random() > 0.8 ? "3px" : "1.5px",
					height: Math.random() > 0.8 ? "3px" : "1.5px",
					backgroundColor: "#fff",
					borderRadius: "50%",
					pointerEvents: "none",
					opacity: "0",
					boxShadow: Math.random() > 0.9 ? "0 0 5px #fff" : "none",
				});
				this.container?.appendChild(el);
				this.stars.push({
					el,
					x: Math.random() * 100,
					y: Math.random() * 100,
					parallax: Math.random() * 0.4 + 0.1,
					opacity,
				});
			}
		}

		const vh = window.innerHeight;
		this.stars.forEach((s) => {
			const yPos = ((s.y * vh) / 100 + altitude * s.parallax) % vh;
			s.el.style.left = `${s.x}%`;
			s.el.style.top = `${yPos}px`;
			s.el.style.opacity = `${Math.min(1, altitude / 1000) * s.opacity}`;
		});
	}

	private hideStars() {
		this.stars.forEach((s) => (s.el.style.opacity = "0"));
	}

	public stop() {
		this.unlockScroll();
		if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
		if (this.runner) Runner.stop(this.runner);
		if (this.clickHandler) window.removeEventListener("mousedown", this.clickHandler);
		if (this.resizeHandler) window.removeEventListener("resize", this.resizeHandler);

		const main = document.querySelector("main");
		if (main) main.style.opacity = "1";

		if (this.originalTheme === "light") {
			document.documentElement.classList.remove("dark");
		} else {
			document.documentElement.classList.add("dark");
		}

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
				this.stars = [];
				this.isInfiniteMode = false;
			}, 1000);
		}
	}
}

export const moonJumper = new MoonJumper();
export const startMoonJumper = () => {
	moonJumper.start();
};
export const stopMoonJumper = () => moonJumper.stop();
