class MobileCommandCenter {
	private overlay: HTMLDivElement | null = null;
	private inputBuffer: string = "";

	public init() {
		const footer = document.querySelector("footer");
		if (!footer) return;

		let tapCount = 0;
		let lastTap = 0;

		footer.addEventListener("touchstart", (e) => {
			// Check if the tap is NOT on a link or name part if possible
			const target = e.target as HTMLElement;
			if (target.tagName === "A" || target.closest("a")) return;

			const now = Date.now();
			if (now - lastTap < 400) {
				tapCount++;
			} else {
				tapCount = 1;
			}
			lastTap = now;

			if (tapCount === 3) {
				tapCount = 0;
				this.showKeyboard();
			}
		});
	}

	private showKeyboard() {
		if (this.overlay) return;

		this.overlay = document.createElement("div");
		Object.assign(this.overlay.style, {
			position: "fixed",
			bottom: "0",
			left: "0",
			width: "100%",
			padding: "20px",
			backgroundColor: "rgba(0,0,0,0.8)",
			zIndex: "10000",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			backdropFilter: "blur(10px)",
		});

		const title = document.createElement("div");
		title.textContent = "MOBILE COMMAND CENTER";
		title.style.color = "#00ff00";
		title.style.fontFamily = "monospace";
		title.style.marginBottom = "10px";
		this.overlay.appendChild(title);

		const display = document.createElement("div");
		display.style.width = "100%";
		display.style.height = "40px";
		display.style.backgroundColor = "#222";
		display.style.color = "#00ff00";
		display.style.fontFamily = "monospace";
		display.style.display = "flex";
		display.style.alignItems = "center";
		display.style.padding = "0 10px";
		display.style.marginBottom = "20px";
		display.style.border = "1px solid #00ff00";
		display.textContent = "> ";
		this.overlay.appendChild(display);

		const keyboard = document.createElement("div");
		keyboard.style.display = "grid";
		keyboard.style.gridTemplateColumns = "repeat(10, 1fr)";
		keyboard.style.gap = "5px";
		keyboard.style.width = "100%";

		const keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
		keys.forEach((key) => {
			const btn = document.createElement("button");
			btn.textContent = key;
			btn.style.padding = "10px 0";
			btn.style.backgroundColor = "#444";
			btn.style.color = "white";
			btn.style.border = "none";
			btn.style.borderRadius = "4px";
			btn.style.fontSize = "16px";
			btn.addEventListener("touchstart", (e) => {
				e.preventDefault();
				this.inputBuffer += key;
				display.textContent = "> " + this.inputBuffer;
			});
			keyboard.appendChild(btn);
		});

		const bottomRow = document.createElement("div");
		bottomRow.style.gridColumn = "span 10";
		bottomRow.style.display = "flex";
		bottomRow.style.gap = "5px";
		bottomRow.style.marginTop = "5px";

		const backBtn = document.createElement("button");
		backBtn.textContent = "DEL";
		backBtn.style.flex = "1";
		backBtn.style.padding = "10px";
		backBtn.style.backgroundColor = "#633";
		backBtn.style.color = "white";
		backBtn.style.border = "none";
		backBtn.addEventListener("touchstart", (e) => {
			e.preventDefault();
			this.inputBuffer = this.inputBuffer.slice(0, -1);
			display.textContent = "> " + this.inputBuffer;
		});

		const enterBtn = document.createElement("button");
		enterBtn.textContent = "ENTER";
		enterBtn.style.flex = "2";
		enterBtn.style.padding = "10px";
		enterBtn.style.backgroundColor = "#363";
		enterBtn.style.color = "white";
		enterBtn.style.border = "none";
		enterBtn.addEventListener("touchstart", (e) => {
			e.preventDefault();
			this.executeCommand(this.inputBuffer);
			this.inputBuffer = "";
			display.textContent = "> ";
		});

		const closeBtn = document.createElement("button");
		closeBtn.textContent = "CLOSE";
		closeBtn.style.flex = "1";
		closeBtn.style.padding = "10px";
		closeBtn.style.backgroundColor = "#444";
		closeBtn.style.color = "white";
		closeBtn.style.border = "none";
		closeBtn.addEventListener("touchstart", (e) => {
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
			this.overlay.remove();
			this.overlay = null;
			this.inputBuffer = "";
		}
	}

	private executeCommand(cmd: string) {
		// Simulate key events for FlowKeys
		const chars = cmd.split("");
		chars.forEach((char) => {
			window.dispatchEvent(new KeyboardEvent("keydown", { key: char.toUpperCase() }));
		});
		// Most commands in key-command.ts don't need Enter, but some might.
	}
}

export const mobileCommandCenter = new MobileCommandCenter();
