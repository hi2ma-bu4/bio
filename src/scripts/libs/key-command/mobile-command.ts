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

		this.overlay = document.createElement("div");
		this.overlay.id = "mobile-command-overlay";
		Object.assign(this.overlay.style, {
			position: "fixed",
			bottom: "0",
			left: "0",
			width: "100%",
			padding: "20px",
			backgroundColor: "rgba(10, 10, 10, 0.95)",
			zIndex: "10000",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			backdropFilter: "blur(15px)",
			borderTop: "1px solid #00a6f4",
			boxShadow: "0 -10px 30px rgba(0,0,0,0.5)",
			transition: "transform 0.3s ease-out",
			transform: "translateY(0)",
			boxSizing: "border-box",
		});

		const title = document.createElement("div");
		title.textContent = "--- MOBILE COMMAND CENTER ---";
		title.style.color = "#00a6f4";
		title.style.fontFamily = "monospace";
		title.style.fontSize = "12px";
		title.style.marginBottom = "10px";
		title.style.letterSpacing = "2px";
		this.overlay.appendChild(title);

		const display = document.createElement("div");
		display.style.width = "100%";
		display.style.height = "50px";
		display.style.backgroundColor = "#000";
		display.style.color = "#00ff00";
		display.style.fontFamily = "monospace";
		display.style.display = "flex";
		display.style.alignItems = "center";
		display.style.padding = "0 15px";
		display.style.marginBottom = "20px";
		display.style.border = "1px solid #333";
		display.style.borderRadius = "4px";
		display.style.fontSize = "18px";
		display.style.boxSizing = "border-box";
		display.textContent = "> ";
		this.overlay.appendChild(display);

		const keyboard = document.createElement("div");
		keyboard.style.display = "grid";
		keyboard.style.gridTemplateColumns = "repeat(10, 1fr)";
		keyboard.style.gap = "6px";
		keyboard.style.width = "100%";

		const keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
		keys.forEach((key) => {
			const btn = document.createElement("button");
			btn.textContent = key;
			btn.style.padding = "12px 0";
			btn.style.backgroundColor = "#222";
			btn.style.color = "#fff";
			btn.style.border = "1px solid #444";
			btn.style.borderRadius = "6px";
			btn.style.fontSize = "16px";
			btn.style.fontWeight = "bold";
			btn.style.touchAction = "manipulation";
			btn.addEventListener("click", (e) => {
				e.preventDefault();
				this.inputBuffer += key;
				display.textContent = "> " + this.inputBuffer;
				btn.style.backgroundColor = "#00a6f4";
				setTimeout(() => (btn.style.backgroundColor = "#222"), 100);
			});
			keyboard.appendChild(btn);
		});

		const bottomRow = document.createElement("div");
		bottomRow.style.gridColumn = "span 10";
		bottomRow.style.display = "flex";
		bottomRow.style.gap = "6px";
		bottomRow.style.marginTop = "6px";

		const backBtn = document.createElement("button");
		backBtn.textContent = "DEL";
		backBtn.style.flex = "1";
		backBtn.style.padding = "12px";
		backBtn.style.backgroundColor = "#422";
		backBtn.style.color = "#fff";
		backBtn.style.border = "1px solid #633";
		backBtn.style.borderRadius = "6px";
		backBtn.addEventListener("click", (e) => {
			e.preventDefault();
			this.inputBuffer = this.inputBuffer.slice(0, -1);
			display.textContent = "> " + this.inputBuffer;
		});

		const enterBtn = document.createElement("button");
		enterBtn.textContent = "ENTER";
		enterBtn.style.flex = "2";
		enterBtn.style.padding = "12px";
		enterBtn.style.backgroundColor = "#242";
		enterBtn.style.color = "#fff";
		enterBtn.style.border = "1px solid #363";
		enterBtn.style.borderRadius = "6px";
		enterBtn.style.fontWeight = "bold";
		enterBtn.addEventListener("click", (e) => {
			e.preventDefault();
			this.executeCommand(this.inputBuffer);
			this.inputBuffer = "";
			display.textContent = "> ";
		});

		const closeBtn = document.createElement("button");
		closeBtn.textContent = "CLOSE";
		closeBtn.style.flex = "1";
		closeBtn.style.padding = "12px";
		closeBtn.style.backgroundColor = "#333";
		closeBtn.style.color = "#fff";
		closeBtn.style.border = "1px solid #444";
		closeBtn.style.borderRadius = "6px";
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
