import { showToast } from "../ui-toast";

interface BuggyElement {
	element: HTMLElement;
	originalHTML: string;
	originalFilter: string;
	isBuggy: boolean;
	repairHandler: (e: MouseEvent) => void;
}

class BugHunt {
	private buggyElements: BuggyElement[] = [];
	private interval: number | null = null;
	private score = 0;
	private combo = 0;
	private lastRepairTime = 0;
	private isActive = false;

	public start() {
		if (this.isActive) return;
		this.isActive = true;
		this.score = 0;
		this.combo = 0;

		const elements = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, a, button, img");
		elements.forEach((el) => {
			if (el instanceof HTMLElement) {
				const handler = (e: MouseEvent) => this.repair(el, e);
				this.buggyElements.push({
					element: el,
					originalHTML: el.innerHTML,
					originalFilter: el.style.filter,
					isBuggy: false,
					repairHandler: handler,
				});
				el.addEventListener("click", handler);
			}
		});

		this.interval = window.setInterval(() => this.spawnBug(), 2000);
	}

	private spawnBug() {
		if (!this.isActive) return;

		const healthyOnes = this.buggyElements.filter((b) => !b.isBuggy);
		if (healthyOnes.length === 0) return;

		const target = healthyOnes[Math.floor(Math.random() * healthyOnes.length)];
		target.isBuggy = true;

		if (target.element.tagName === "IMG") {
			target.element.style.filter = `hue-rotate(${Math.random() * 360}deg) blur(5px) invert(1)`;
		} else {
			target.element.innerHTML = this.glitchHTML(target.element.innerHTML);
			target.element.style.color = "#0f0";
			target.element.style.backgroundColor = "#000";
		}

		target.element.style.transition = "all 0.3s ease";
		target.element.classList.add("buggy-animation");

		if (!document.getElementById("bug-hunt-style")) {
			const style = document.createElement("style");
			style.id = "bug-hunt-style";
			style.textContent = `
				@keyframes buggy-flicker {
					0% { opacity: 1; transform: translateX(0); }
					20% { opacity: 0.8; transform: translateX(-2px); }
					40% { opacity: 1; transform: translateX(2px); }
					100% { opacity: 1; transform: translateX(0); }
				}
				.buggy-animation {
					animation: buggy-flicker 0.2s infinite;
					pointer-events: auto !important;
				}
			`;
			document.head.appendChild(style);
		}
	}

	private glitchHTML(html: string): string {
		const chars = "!@#$%^&*()_+-=[]{}|;':\",./<>?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		// Only glitch text nodes, avoid breaking HTML tags
		return html.replace(/>[^<]+</g, (match) => {
			return match
				.split("")
				.map((c) => (c !== ">" && c !== "<" && Math.random() > 0.7 ? chars[Math.floor(Math.random() * chars.length)] : c))
				.join("");
		});
	}

	private repair(el: HTMLElement, e: MouseEvent) {
		const target = this.buggyElements.find((b) => b.element === el);
		if (target && target.isBuggy) {
			e.preventDefault();
			e.stopPropagation();

			target.isBuggy = false;
			el.classList.remove("buggy-animation");
			el.style.filter = target.originalFilter;
			el.style.color = "";
			el.style.backgroundColor = "";
			el.innerHTML = target.originalHTML;

			// Combo & Score
			const now = Date.now();
			if (now - this.lastRepairTime < 1000) {
				this.combo++;
			} else {
				this.combo = 1;
			}
			this.lastRepairTime = now;
			this.score += 10 * this.combo;

			if (this.combo > 1) {
				showToast(`🔧 Fixed! ${this.combo} Combo! (Score: ${this.score})`, 1000);
			}

			if (this.score >= 500) {
				this.optimizeSite();
			}
		}
	}

	private optimizeSite() {
		this.stop();
		showToast("🏆 Site Optimized! Gold Theme Unlocked!", 5000);
		document.body.style.filter = "sepia(1) saturate(5) hue-rotate(-50deg)";
		document.body.style.transition = "filter 5s ease-out";
		setTimeout(() => {
			document.body.style.filter = "";
		}, 10000);
	}

	public stop() {
		this.isActive = false;
		if (this.interval) clearInterval(this.interval);
		this.interval = null;

		this.buggyElements.forEach((b) => {
			b.element.removeEventListener("click", b.repairHandler);
			b.element.classList.remove("buggy-animation");
			b.element.style.filter = b.originalFilter;
			b.element.style.color = "";
			b.element.style.backgroundColor = "";
			b.element.innerHTML = b.originalHTML;
		});
		this.buggyElements = [];
		document.getElementById("bug-hunt-style")?.remove();
	}
}

export const bugHunt = new BugHunt();
export const startBugHunt = () => bugHunt.start();
export const stopBugHunt = () => bugHunt.stop();
