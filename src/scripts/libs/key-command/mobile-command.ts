import { addStyle, removeStyle } from "../ui-utils";
import mobileCommandStyles from "./mobile-command.css?inline";

class MobileCommandCenter {
	private overlay: HTMLDivElement | null = null;
	private inputBuffer: string = "";

	public init() {
		// Use document listener for more reliable mobile tap detection
		let tapCount = 0;
		let lastTap = 0;

		const handleTap = (e: Event) => {
			const target = e.target as HTMLElement;
			const footer = document.querySelector("footer");
			if (!footer || !footer.contains(target)) return;

			if (target.tagName === "A" || target.closest("a")) return;

			const now = Date.now();
			if (now - lastTap < 500) {
				tapCount++;
			} else {
				tapCount = 1;
			}
			lastTap = now;

			if (tapCount === 5) {
				tapCount = 0;
				this.showKeyboard();
			}
		};

		document.addEventListener("touchstart", handleTap, { passive: true });
		document.addEventListener("click", handleTap);
	}

	private showKeyboard() {
		if (this.overlay) return;

		addStyle(mobileCommandStyles, "mobile-command-style");

		this.overlay = document.createElement("div");
		this.overlay.id = "mobile-command-overlay";

		const title = document.createElement("div");
		title.textContent = "--- MOBILE COMMAND CENTER ---";
		title.className = "mobile-command-title";
		this.overlay.appendChild(title);

		const display = document.createElement("div");
		display.className = "mobile-command-display";
		display.textContent = "> ";
		this.overlay.appendChild(display);

		const keyboard = document.createElement("div");
		keyboard.className = "mobile-command-keyboard";

		const keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
		keys.forEach((key) => {
			const btn = document.createElement("button");
			btn.textContent = key;
			btn.className = "mobile-command-key";
			btn.addEventListener("click", (e) => {
				e.preventDefault();
				this.inputBuffer += key;
				display.textContent = "> " + this.inputBuffer;
				btn.style.backgroundColor = "#00a6f4";
				setTimeout(() => (btn.style.backgroundColor = ""), 100);
			});
			keyboard.appendChild(btn);
		});

		const bottomRow = document.createElement("div");
		bottomRow.className = "mobile-command-bottom-row";

		const backBtn = document.createElement("button");
		backBtn.textContent = "DEL";
		backBtn.className = "mobile-command-del";
		backBtn.addEventListener("click", (e) => {
			e.preventDefault();
			this.inputBuffer = this.inputBuffer.slice(0, -1);
			display.textContent = "> " + this.inputBuffer;
		});

		const enterBtn = document.createElement("button");
		enterBtn.textContent = "ENTER";
		enterBtn.className = "mobile-command-enter";
		enterBtn.addEventListener("click", (e) => {
			e.preventDefault();
			this.executeCommand(this.inputBuffer);
			this.inputBuffer = "";
			display.textContent = "> ";
		});

		const closeBtn = document.createElement("button");
		closeBtn.textContent = "CLOSE";
		closeBtn.className = "mobile-command-close";
		closeBtn.addEventListener("click", (e) => {
			e.preventDefault();
			this.hideKeyboard();
		});

		bottomRow.appendChild(backBtn);
		bottomRow.appendChild(enterBtn);
		bottomRow.appendChild(closeBtn);
		keyboard.appendChild(bottomRow);

		this.overlay.appendChild(keyboard);
		document.body.appendChild(this.overlay);
	}

	private hideKeyboard() {
		if (this.overlay) {
			this.overlay.style.transform = "translateY(100%)";
			setTimeout(() => {
				this.overlay?.remove();
				this.overlay = null;
				this.inputBuffer = "";
				removeStyle("mobile-command-style");
			}, 300);
		}
	}

	private executeCommand(cmd: string) {
		const chars = cmd.split("");
		chars.forEach((char) => {
			window.dispatchEvent(new KeyboardEvent("keydown", { key: char.toUpperCase() }));
			window.dispatchEvent(new KeyboardEvent("keyup", { key: char.toUpperCase() }));
		});
		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
		window.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
	}
}

export const mobileCommandCenter = new MobileCommandCenter();
