import { deviceType } from "detect-it";

export interface BasementLog {
	message: string;
	color?: string;
	bgColor?: string;
	bold?: boolean;
	blink?: boolean;
	underline?: boolean;
}

const AA_HEADER = String.raw`███████╗███╗   ██╗ ██████╗ ██╗    ██╗███████╗
██╔════╝████╗  ██║██╔═══██╗██║    ██║██╔════╝
███████╗██╔██╗ ██║██║   ██║██║ █╗ ██║███████╗
╚════██║██║╚██╗██║██║   ██║██║███╗██║╚════██║
███████║██║ ╚████║╚██████╔╝╚███╔███╔╝███████║
╚══════╝╚═╝  ╚═══╝ ╚═════╝  ╚══╝╚══╝ ╚══════╝
 ███████╗██╗████████╗███████╗
 ██╔════╝██║╚══██╔══╝██╔════╝
 ███████╗██║   ██║   █████╗  
 ╚════██║██║   ██║   ██╔══╝  
 ███████║██║   ██║   ███████╗
 ╚══════╝╚═╝   ╚═╝   ╚══════╝`;

const FIXED_LOGS: BasementLog[] = [
	{ message: AA_HEADER, color: "#00ff00", bold: true },
	{ message: "=== INFINITE BASEMENT ACCESS GRANTED ===", color: "#ff00ff", bold: true },
	{ message: "System: {ua}", color: "#00ffff" },
	{ message: "Session ID: {uuid}", color: "#ffff00" },
	{ message: "----------------------------------------", color: "#888888" },
];

const RANDOM_LOGS: BasementLog[] = [
	{ message: "Initializing basement protocols...", color: "#00ff00" },
	{ message: "Connecting to the deep web...", color: "#00ff00" },
	{ message: "Loading legacy modules...", color: "#00ff00" },
	{ message: "Scanning for hidden directories...", color: "#00ff00" },
	{ message: "Found: /secret/archive/{uuid}", color: "#ffff00", bold: true },
	{ message: "Decrypting payload...", color: "#00ff00" },
	{ message: "Accessing mainframe...", color: "#ff0000", bold: true, bgColor: "#330000" },
	{ message: "Stack trace: Astro -> Solid.js -> TailwindCSS v4", color: "#888888" },
	{ message: "Memory usage: 0.0001% of infinity", color: "#00ff00" },
	{ message: "Status: All systems GO", color: "#00ff00", bold: true },
	{ message: "Fun fact: This basement is procedurally generated.", color: "#00ffff" },
	{ message: "Looking for something?", color: "#00ff00" },
	{ message: "The cake is a lie.", color: "#ff00ff" },
	{ message: "42 is the answer.", color: "#ffffff", bold: true },
	{ message: "Building the future, one byte at a time.", color: "#00ff00" },
	{ message: "Warning: Deep level reached.", color: "#ff0000", blink: true },
	{ message: "Gravity here is slightly different.", color: "#00ff00" },
	{ message: "Can you hear the fans spinning?", color: "#00ff00" },
	{ message: "Tracing route to 127.0.0.1...", color: "#00ff00" },
	{ message: "Establishing secure tunnel...", color: "#00ff00" },
	{ message: "Optimizing assets for the void...", color: "#00ff00" },
	{ message: "Hello, world.", color: "#00ff00" },
	{ message: "End of file? Not quite.", color: "#00ff00" },
	{ message: "Line number: {line}", color: "#ffffff" },
	{ message: "System info: {ua}", color: "#00ff00" },
	{ message: "Processing core {uuid}...", color: "#00bbff" },
	{ message: "ERROR: Out of bounds exception at line {line}", color: "#ffffff", bgColor: "#aa0000", bold: true },
	{ message: "SUCCESS: Payload delivered to {ua}", color: "#000000", bgColor: "#44ff44" },
	{ message: "[ALERT] Unauthorized access detected at {uuid}", color: "#ffff00", bgColor: "#000000", bold: true, blink: true },
	{ message: "Fetching metadata for record {line}...", color: "#bbbbbb" },
	{ message: "Dumping memory core...\n0x0000: 48 65 6c 6c 6f\n0x0008: 20 57 6f 72 6c\n0x0010: 64 21 00 00 00", color: "#00ff00" },
	{ message: ">>> SECURITY BREACH IN PROGRESS <<<", color: "#ffffff", bgColor: "#ff0000", bold: true, blink: true, underline: true },
	{ message: "Tracing connection from {ua}...", color: "#00ffff", underline: true },
	{ message: "Encryption Level: 4096-bit AES", color: "#00ff00", bold: true },
	{ message: "Packet lost at node {line}. Retrying...", color: "#ff8800" },
	{ message: "System.Entropy: Low", color: "#8800ff" },
	{ message: "User Session: {uuid} validated.", color: "#00ff88" },
	{ message: "CRITICAL: Kernel panic at {uuid}\nReason: Divided by zero in line {line}", color: "#ffffff", bgColor: "#880000", bold: true },
	{ message: "[PROMPT] User: <span style='color:#00ffff;font-weight:bold'>guest</span>@{uuid}:~$ <span style='color:#ffffff'>ls -la /secret</span>", color: "#00ff00" },
	{ message: "PERMISSION DENIED: <span style='background-color:#ff0000;color:#ffffff;padding:0 4px'>ACCESS_RESTRICTED</span>", color: "#ff0000", bold: true },
];

export class InfiniteBasement {
	private container: HTMLDivElement | null = null;
	private observer: IntersectionObserver | null = null;
	private basementActive: boolean = false;
	private lineCount = 0;
	private uuid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
	private systemInfoStr: string | null = null;

	private overscrollAmount = 0;
	private overscrollStartTimestamp: number | null = null;
	private lastWheelTimestamp = 0;
	private lastTouchY = 0;
	private isTouching = false;
	private tickId: number | null = null;

	public init() {
		if (this.container) return;

		window.addEventListener("scroll", this.handleScroll, { passive: true });
		window.addEventListener("wheel", this.handleWheel, { passive: true });
		window.addEventListener("touchstart", this.handleTouchStart, { passive: true });
		window.addEventListener("touchmove", this.handleTouchMove, { passive: true });
		window.addEventListener("touchend", this.handleTouchEnd, { passive: true });
		window.addEventListener("touchcancel", this.handleTouchEnd, { passive: true });

		this.ensureBlinkStyle();
		this.tick();
	}

	private ensureBlinkStyle() {
		if (document.getElementById("basement-blink-style")) return;
		const style = document.createElement("style");
		style.id = "basement-blink-style";
		style.textContent = `
			@keyframes basement-blink {
				0%, 49% { opacity: 1; }
				50%, 100% { opacity: 0; }
			}
			.basement-blink {
				animation: basement-blink 1s infinite;
			}
		`;
		document.head.appendChild(style);
	}

	private handleScroll = () => {
		if (this.basementActive) return;
		const scrollHeight = document.documentElement.scrollHeight;
		const scrollTop = window.scrollY || window.pageYOffset;
		const clientHeight = window.innerHeight;

		// Reset overscroll if we move away from the bottom
		if (scrollTop + clientHeight < scrollHeight - 10) {
			this.overscrollAmount = 0;
			this.overscrollStartTimestamp = null;
		}
	};

	private handleWheel = (e: WheelEvent) => {
		if (this.basementActive) return;
		this.lastWheelTimestamp = Date.now();
		this.checkOverscroll(e.deltaY);
	};

	private handleTouchStart = (e: TouchEvent) => {
		this.isTouching = true;
		this.lastTouchY = e.touches[0].screenY;
	};

	private handleTouchMove = (e: TouchEvent) => {
		if (this.basementActive) return;
		const currentY = e.touches[0].screenY;
		const delta = this.lastTouchY - currentY;
		this.lastTouchY = currentY;
		this.checkOverscroll(delta);
	};

	private handleTouchEnd = () => {
		this.isTouching = false;
	};

	private checkOverscroll(delta: number) {
		const scrollHeight = document.documentElement.scrollHeight;
		const scrollTop = window.scrollY || window.pageYOffset;
		const clientHeight = window.innerHeight;
		const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;

		if (isAtBottom && delta > 0) {
			this.overscrollAmount += delta;
		} else if (delta < 0) {
			this.overscrollAmount = Math.max(0, this.overscrollAmount + delta);
		}
	}

	private tick = () => {
		if (this.basementActive) return;

		const now = Date.now();
		const scrollHeight = document.documentElement.scrollHeight;
		const scrollTop = window.scrollY || window.pageYOffset;
		const clientHeight = window.innerHeight;
		const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

		// Decay overscroll if not actively scrolling
		if (!this.isTouching && now - this.lastWheelTimestamp > 200) {
			this.overscrollAmount = Math.max(0, this.overscrollAmount * 0.9 - 1);
		}

		if (isAtBottom && this.overscrollAmount >= 80) {
			if (!this.overscrollStartTimestamp) {
				this.overscrollStartTimestamp = now;
			} else if (now - this.overscrollStartTimestamp >= 5000) {
				this.activateBasement();
				return; // Stop ticking
			}
		} else {
			this.overscrollStartTimestamp = null;
		}

		this.tickId = requestAnimationFrame(this.tick);
	};

	private async activateBasement() {
		if (this.basementActive) return;
		this.basementActive = true;

		if (this.tickId) cancelAnimationFrame(this.tickId);

		this.container = document.createElement("div");
		this.container.id = "infinite-basement";
		Object.assign(this.container.style, {
			width: "100%",
			backgroundColor: "#050505",
			color: "#00ff00",
			fontFamily: "Consolas, 'Courier New', Courier, monospace",
			padding: "40px 20px",
			overflow: "hidden",
			minHeight: "100vh",
			display: "flex",
			flexDirection: "column",
			gap: "2px",
			fontSize: deviceType === "mouseOnly" ? "13px" : "7px",
			lineHeight: "1.2",
			boxShadow: "inset 0 10px 20px rgba(0,0,0,1)",
			position: "relative",
			zIndex: "9999",
			textShadow: "0 0 2px rgba(0, 255, 0, 0.4)",
		});

		document.body.appendChild(this.container);

		// Initial logs (Fixed ones)
		for (const log of FIXED_LOGS) {
			await this.addLogElement(log);
		}

		this.setupInfiniteScroll();
	}

	private setupInfiniteScroll() {
		const sentinel = document.createElement("div");
		sentinel.id = "basement-sentinel";
		sentinel.style.height = "50px";
		this.container!.appendChild(sentinel);

		this.observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					this.addMoreLogs();
				}
			},
			{ rootMargin: "0px 0px 800px 0px" },
		);

		this.observer.observe(sentinel);

		// Initial more logs
		this.addMoreLogs();
	}

	private async addMoreLogs() {
		if (!this.container) return;

		for (let i = 0; i < 20; i++) {
			const log = RANDOM_LOGS[Math.floor(Math.random() * RANDOM_LOGS.length)];
			await this.addLogElement(log);
		}
	}

	private async addLogElement(logEntry: BasementLog) {
		const messageTemplate = await this.formatGlobalPlaceholders(logEntry.message);
		const lines = messageTemplate.split("\n");
		const sentinel = document.getElementById("basement-sentinel");

		for (const line of lines) {
			// Skip first empty line if it's AA or multi-line starting with \n
			if (line === "" && lines.length > 1 && line === lines[0]) continue;

			this.lineCount++;
			const logDiv = document.createElement("div");
			const timestamp = new Date().toISOString().split("T")[1].split("Z")[0];

			// Replace {line} placeholder per line
			const finalLine = line.replaceAll("{line}", this.lineCount.toString());

			const ts = `[${new Date().toISOString().split("T")[1].split("Z")[0]}] `;

			if (finalLine.includes("<span")) {
				logDiv.innerHTML = ts + finalLine;
			} else {
				logDiv.textContent = ts + finalLine;
			}

			if (logEntry.color) logDiv.style.color = logEntry.color;
			if (logEntry.bgColor) logDiv.style.backgroundColor = logEntry.bgColor;
			if (logEntry.bold) logDiv.style.fontWeight = "bold";
			if (logEntry.underline) logDiv.style.textDecoration = "underline";
			if (logEntry.blink) logDiv.classList.add("basement-blink");

			logDiv.style.whiteSpace = "pre-wrap";
			logDiv.style.wordBreak = "break-all";
			logDiv.style.padding = "2px 4px";

			if (sentinel) {
				this.container!.insertBefore(logDiv, sentinel);
			} else {
				this.container!.appendChild(logDiv);
			}
		}
	}

	private async formatGlobalPlaceholders(template: string): Promise<string> {
		let msg = template;
		if (msg.includes("{ua}")) {
			const info = await this.getSystemInfoString();
			msg = msg.replaceAll("{ua}", info);
		}
		if (msg.includes("{uuid}")) {
			msg = msg.replaceAll("{uuid}", this.uuid);
		}
		return msg;
	}

	private async getSystemInfoString(): Promise<string> {
		if (this.systemInfoStr) return this.systemInfoStr;

		const ua = navigator.userAgent;
		let os = "Unknown OS";
		if (ua.includes("Windows NT")) os = "Windows";
		else if (ua.includes("Mac OS X")) os = "macOS";
		else if (ua.includes("Android")) os = "Android";
		else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
		else if (ua.includes("Linux")) os = "Linux";

		let browser = "Unknown Browser";
		if (ua.includes("Edg/")) browser = "Edge";
		else if (ua.includes("Chrome/")) browser = "Chrome";
		else if (ua.includes("Firefox/")) browser = "Firefox";
		else if (ua.includes("Safari/")) browser = "Safari";

		let device = "PC";
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
			device = "Mobile/Tablet";
		}

		let cpu = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : "Unknown CPU";

		let gpu = "Unknown GPU";
		try {
			const canvas = document.createElement("canvas");
			const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
			if (gl) {
				const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
				if (debugInfo) {
					gpu = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string) || "Unknown GPU";
				}
			}
		} catch (e) {}

		this.systemInfoStr = `${os} (${device}), ${browser}, CPU: ${cpu}, GPU: ${gpu}`;
		return this.systemInfoStr;
	}

	public destroy() {
		this.container?.remove();
		this.container = null;
		this.observer?.disconnect();
		this.observer = null;
		this.basementActive = false;
		if (this.tickId) cancelAnimationFrame(this.tickId);

		window.removeEventListener("scroll", this.handleScroll);
		window.removeEventListener("wheel", this.handleWheel);
		window.removeEventListener("touchstart", this.handleTouchStart);
		window.removeEventListener("touchmove", this.handleTouchMove);
		window.removeEventListener("touchend", this.handleTouchEnd);
		window.removeEventListener("touchcancel", this.handleTouchEnd);
	}
}

export const infiniteBasement = new InfiniteBasement();
