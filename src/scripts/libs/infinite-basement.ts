export class InfiniteBasement {
	private container: HTMLDivElement | null = null;
	private observer: IntersectionObserver | null = null;
	private basementActive: boolean = false;
	private logs: string[] = [
		"Initializing basement protocols...",
		"Connecting to the deep web...",
		"Loading legacy modules...",
		"Scanning for hidden directories...",
		"Found: /secret/archive/2024",
		"Decrypting payload...",
		"Accessing mainframe...",
		"Stack trace: Astro -> Solid.js -> TailwindCSS v4",
		"Memory usage: 0.0001% of infinity",
		"Status: All systems GO",
		"Fun fact: This basement is procedurally generated.",
		"Looking for something?",
		"The cake is a lie.",
		"42 is the answer.",
		"Building the future, one byte at a time.",
		"Warning: Deep level reached.",
		"Gravity here is slightly different.",
		"Can you hear the fans spinning?",
		"Tracing route to 127.0.0.1...",
		"Establishing secure tunnel...",
		"Optimizing assets for the void...",
		"Hello, world.",
		"End of file? Not quite.",
	];

	public init() {
		if (this.container) return;

		window.addEventListener("scroll", () => this.handleScroll(), { passive: true });
		// Also check on init in case we are already at the bottom
		setTimeout(() => this.handleScroll(), 1000);
	}

	private handleScroll() {
		const scrollHeight = document.documentElement.scrollHeight;
		const scrollTop = window.scrollY || window.pageYOffset;
		const clientHeight = window.innerHeight;

		// Trigger when close to the bottom
		if (scrollTop + clientHeight >= scrollHeight - 5 && !this.basementActive) {
			this.activateBasement();
		}
	}

	private activateBasement() {
		if (this.basementActive) return;
		this.basementActive = true;

		this.container = document.createElement("div");
		this.container.id = "infinite-basement";
		Object.assign(this.container.style, {
			width: "100%",
			backgroundColor: "#050505",
			color: "#00ff00",
			fontFamily: "'Courier New', Courier, monospace",
			padding: "40px 20px",
			overflow: "hidden",
			minHeight: "100vh",
			display: "flex",
			flexDirection: "column",
			gap: "10px",
			fontSize: "14px",
			lineHeight: "1.5",
			boxShadow: "inset 0 10px 20px rgba(0,0,0,1)",
			position: "relative",
			zIndex: "9999",
		});

		const header = document.createElement("div");
		header.textContent = "=== INFINITE BASEMENT ACCESS GRANTED ===";
		header.style.textAlign = "center";
		header.style.marginBottom = "20px";
		header.style.color = "#ff00ff";
		header.style.fontWeight = "bold";
		this.container.appendChild(header);

		document.body.appendChild(this.container);

		this.setupInfiniteScroll();
	}

	private setupInfiniteScroll() {
		const sentinel = document.createElement("div");
		sentinel.id = "basement-sentinel";
		sentinel.style.height = "20px";
		this.container!.appendChild(sentinel);

		this.observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					this.addMoreLogs();
				}
			},
			{ rootMargin: "0px 0px 400px 0px" },
		);

		this.observer.observe(sentinel);

		// Initial logs
		this.addMoreLogs();
	}

	private addMoreLogs() {
		if (!this.container) return;

		const sentinel = document.getElementById("basement-sentinel");
		if (!sentinel) return;

		for (let i = 0; i < 20; i++) {
			const log = document.createElement("div");
			const timestamp = new Date().toISOString().split("T")[1].split("Z")[0];
			const message = this.logs[Math.floor(Math.random() * this.logs.length)];
			log.textContent = `[${timestamp}] ${message}`;

			if (Math.random() > 0.9) log.style.color = "#ffff00";
			if (Math.random() > 0.95) log.style.color = "#ff0000";

			this.container.insertBefore(log, sentinel);
		}
	}

	public destroy() {
		this.container?.remove();
		this.container = null;
		this.observer?.disconnect();
		this.observer = null;
		this.basementActive = false;
	}
}

export const infiniteBasement = new InfiniteBasement();
