import { addStyle, removeStyle } from "../ui-utils";
import bugHuntStyles from "./bug-hunt.css?inline";

interface BuggyElement {
	element: HTMLElement;
	originalTextMap: Map<Text, string>;
	originalStyle: {
		filter: string;
		transform: string;
		textShadow: string;
		position: string;
		zIndex: string;
	};
	isBuggy: boolean;
	repairHandler: (e: MouseEvent) => void;
}

class BugHunt {
	private buggyElements: BuggyElement[] = [];
	private interval: number | null = null;
	private score = 0;
	private isActive = false;
	private styleElement: HTMLStyleElement | null = null;

	public start() {
		if (this.isActive) return;
		this.isActive = true;
		this.score = 0;

		const elements = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, a, button, img");
		elements.forEach((el) => {
			if (el instanceof HTMLElement) {
				// Only target elements with text or images
				const hasText = (el.textContent || "").trim().length > 0;
				const isImg = el.tagName === "IMG";

				if (!isImg) {
					if (!hasText) return;
					const hasDirectText = Array.from(el.childNodes).some((c) => c.nodeType === 3 && c.textContent?.trim());
					if (!hasDirectText) return;
				}

				const textMap = new Map<Text, string>();
				if (hasText) {
					this.collectTextNodes(el, textMap);
				}

				const handler = (e: MouseEvent) => this.repair(el, e);
				this.buggyElements.push({
					element: el,
					originalTextMap: textMap,
					originalStyle: {
						filter: el.style.filter,
						transform: el.style.transform,
						textShadow: el.style.textShadow,
						position: el.style.position,
						zIndex: el.style.zIndex,
					},
					isBuggy: false,
					repairHandler: handler,
				});
				el.addEventListener("click", handler);
			}
		});

		this.injectStyles();
		this.interval = window.setInterval(() => this.spawnBug(), 1500 + Math.random() * 3000);
	}

	private collectTextNodes(node: Node, map: Map<Text, string>) {
		if (node.nodeType === Node.TEXT_NODE) {
			const content = node.textContent?.trim();
			if (content && content.length > 0) {
				map.set(node as Text, node.textContent || "");
			}
		} else {
			node.childNodes.forEach((child) => this.collectTextNodes(child, map));
		}
	}

	private injectStyles() {
		addStyle(bugHuntStyles, "bug-hunt-style");
	}

	private spawnBug() {
		if (!this.isActive) return;

		const healthyOnes = this.buggyElements.filter((b) => !b.isBuggy);
		if (healthyOnes.length === 0) return;

		// Spawn 1-3 bugs at once to increase intensity
		const count = Math.min(healthyOnes.length, Math.floor(Math.random() * 3) + 1);
		for (let i = 0; i < count; i++) {
			const index = Math.floor(Math.random() * healthyOnes.length);
			const target = healthyOnes.splice(index, 1)[0];
			if (!target) continue;

			target.isBuggy = true;
			const el = target.element;

			// Visual bug types
			const bugType = Math.random();
			if (el.tagName === "IMG") {
				el.style.filter = `hue-rotate(${Math.random() * 360}deg) invert(1) blur(2px)`;
			} else {
				if (bugType > 0.5) {
					el.classList.add("buggy-chromatic");
				}
				// Scramble text
				target.originalTextMap.forEach((original, node) => {
					node.textContent = this.scramble(original);
				});
			}

			el.classList.add("buggy-glitch");
			el.style.transform = `skew(${Math.random() * 10 - 5}deg) scale(${1 + Math.random() * 0.1})`;
		}
	}

	private scramble(text: string): string {
		const chars = "!@#$%^&*()_+-=[]{}|;':\",./<>?0123456789";
		return text
			.split("")
			.map((c) => (Math.random() > 0.6 ? chars[Math.floor(Math.random() * chars.length)] : c))
			.join("");
	}

	private repair(el: HTMLElement, e: MouseEvent) {
		const target = this.buggyElements.find((b) => b.element === el);
		if (target && target.isBuggy) {
			e.preventDefault();
			e.stopPropagation();

			this.restoreElement(target);
			this.score += 10;

			if (this.score >= 100 && this.buggyElements.filter((b) => b.isBuggy).length <= 8) {
				this.showVictory();
			}
		}
	}

	private restoreElement(target: BuggyElement) {
		target.isBuggy = false;
		const el = target.element;
		el.classList.remove("buggy-glitch", "buggy-chromatic");
		el.style.filter = target.originalStyle.filter;
		el.style.transform = target.originalStyle.transform;
		el.style.textShadow = target.originalStyle.textShadow;
		el.style.position = target.originalStyle.position;
		el.style.zIndex = target.originalStyle.zIndex;

		target.originalTextMap.forEach((original, node) => {
			node.textContent = original;
		});
	}

	private showVictory() {
		const finalBugCount = this.buggyElements.filter((b) => b.isBuggy).length;
		this.stop();

		// Create a "System Cleaned" terminal overlay
		const overlay = document.createElement("div");
		overlay.className = "bug-victory-overlay";

		const lines = ["> INITIALIZING SYSTEM SCAN...", `> BUGS DETECTED: ${finalBugCount}`, "> OPTIMIZING ASSETS...", "> CACHE PURGED.", "> PERFORMANCE: 100%", `> SCORE: ${this.score}`, "> STATUS: SYSTEM PROTECTED", "", "[ THANK YOU FOR TESTING ]"];

		document.body.appendChild(overlay);

		let lineIdx = 0;
		const typeLine = () => {
			if (lineIdx < lines.length) {
				const line = document.createElement("div");
				line.textContent = lines[lineIdx];
				overlay.appendChild(line);
				lineIdx++;
				setTimeout(typeLine, 200);
			} else {
				setTimeout(() => {
					overlay.style.transition = "opacity 1s ease";
					overlay.style.opacity = "0";
					setTimeout(() => overlay.remove(), 1000);
				}, 3000);
			}
		};

		typeLine();
	}

	public stop() {
		this.isActive = false;
		if (this.interval) clearInterval(this.interval);
		this.interval = null;

		this.buggyElements.forEach((b) => {
			b.element.removeEventListener("click", b.repairHandler);
			this.restoreElement(b);
		});
		this.buggyElements = [];
		removeStyle("bug-hunt-style");
	}
}

export const bugHunt = new BugHunt();
export const startBugHunt = () => bugHunt.start();
export const stopBugHunt = () => bugHunt.stop();
