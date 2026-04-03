import { toCanvas } from "qrcode";

import { lockBodyScroll, unlockBodyScroll } from "../ui-utils";

interface StartBsodEffectOptions {
	force?: boolean;
}

interface FailureScenario {
	stopCode: string;
	failedModule: string;
	bucketId: string;
}

interface PayloadContext extends FailureScenario {
	sessionId: string;
	timestamp: string;
	progressSeed: number;
}

const BSOD_DELAY_MIN = 4_000;
const BSOD_DELAY_MAX = 24_000;
const BSOD_SHORT_DELAY = 120;
const OVERLAY_ID = "bsod-screen";
const STYLE_ID = "bsod-screen-style";

function detectBrowser() {
	const ua = navigator.userAgent;

	if (ua.includes("Edg/")) return "msedge";
	if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "chrome";
	if (ua.includes("Firefox/")) return "firefox";
	if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "safari";

	return "browser";
}

function detectOS(): string {
	const ua = navigator.userAgent;

	if (ua.includes("Windows NT")) return "windows";
	if (ua.includes("Mac OS X")) return "mac";
	if (ua.includes("Linux")) return "linux";

	return "unknown";
}

function getExecutableName(base: string): string {
	const os = detectOS();

	switch (os) {
		case "windows":
			return `${base}.exe`;
		case "mac":
			// macは実際は.appだけどネタ的にはこれが自然
			return `${base}.app`;
		case "linux":
			// Linuxは拡張子つけないのがそれっぽい
			return base;
		default:
			return base;
	}
}

const FAILURE_SCENARIOS: FailureScenario[] = [
	{ stopCode: "AI_TAKING_OVER", failedModule: "skynet.sys", bucketId: "0xRUN_NOW" },
	{ stopCode: "UNEXPECTED_MEME_EXCEPTION", failedModule: "internet.sys", bucketId: "0xMEME_404" },
	{ stopCode: "USER_ATTEMPTED_THINKING", failedModule: "logic.dll", bucketId: "0x0000_ID10T" },
	{ stopCode: "TOO_MANY_TABS_OPEN", failedModule: getExecutableName(detectBrowser()), bucketId: "0xRAM_GONE" },
	{ stopCode: "RECURSIVE_EXISTENTIAL_CRISIS", failedModule: "mind.sys", bucketId: "0xWHY_LOOP" },
	{ stopCode: "OUT_OF_COFFEE_EXCEPTION", failedModule: "caffeine.sys", bucketId: "0xEMPTY_CUP" },
	{ stopCode: "REALITY_ACCESS_DENIED", failedModule: "dreams.dll", bucketId: "0xNO_ESCAPE" },
];

const URLS = ["github.com/hi2ma-bu4", "github.com/hi2ma-bu4/bio/", "davidshimjs.github.io/qrcodejs/", "badapple.stream/", "www.google.com/teapot"];

const QR_PAYLOAD_FACTORIES: Array<(ctx: PayloadContext) => string> = [
	(ctx) => "https://" + URLS[(Math.random() * URLS.length) | 0],
	(ctx) =>
		JSON.stringify({
			stopCode: ctx.stopCode,
			failedModule: ctx.failedModule,
			bucketId: ctx.bucketId,
			sessionId: ctx.sessionId,
			timestamp: ctx.timestamp,
		}),
	(ctx) => `STOPCODE:${ctx.stopCode};WHAT_FAILED:${ctx.failedModule};BUCKET:${ctx.bucketId};SESSION:${ctx.sessionId}`,
	(ctx) => ["WindowsStopDiagnostic", `Code=${ctx.stopCode}`, `Module=${ctx.failedModule}`, `FailureBucket=${ctx.bucketId}`, `Ticket=${ctx.sessionId}`, `Seed=${ctx.progressSeed}`].join("\n"),
];

const STYLE_TEXT = `
.bsod-screen {
	position: fixed;
	inset: 0;
	z-index: 2147483647;
	display: flex;
	min-height: 100dvh;
	width: 100%;
	align-items: flex-start;
	justify-content: center;
	overflow-x: hidden;
	overflow-y: auto;
	background: #0078d7;
	color: #fff;
	font-family: "Segoe UI", "Yu Gothic UI", "Meiryo", sans-serif;
	-webkit-text-size-adjust: 100%;
	overscroll-behavior: contain;
}

.bsod-screen__content {
	box-sizing: border-box;
	display: flex;
	min-height: 100dvh;
	width: min(100%, 68rem);
	flex-direction: column;
	padding:
		max(1.5rem, env(safe-area-inset-top))
		clamp(1rem, 4vw, 4rem)
		max(2rem, env(safe-area-inset-bottom))
		max(1rem, env(safe-area-inset-left));
}

.bsod-screen__face {
	margin: 0 0 0.75rem;
	font-size: clamp(4.75rem, 14vw, 9rem);
	font-weight: 300;
	line-height: 1;
	letter-spacing: -0.08em;
}

.bsod-screen__lead {
	margin: 0;
	max-width: 38rem;
	font-size: clamp(1.25rem, 2.6vw, 2.15rem);
	line-height: 1.45;
}

.bsod-screen__progress {
	margin: clamp(1.75rem, 4vw, 2.5rem) 0 0;
	font-size: clamp(1.15rem, 2vw, 1.55rem);
	line-height: 1.4;
}

.bsod-screen__footer {
	margin-top: clamp(2.5rem, 8vh, 5rem);
	display: flex;
	flex-wrap: wrap;
	gap: 1.5rem 2rem;
	align-items: flex-start;
}

.bsod-screen__qr {
	flex: 0 0 auto;
	height: 8.75rem;
	width: 8.75rem;
	image-rendering: pixelated;
}

.bsod-screen__qr--fallback {
	background:
		linear-gradient(90deg, transparent 42%, #fff 42%, #fff 58%, transparent 58%),
		linear-gradient(transparent 42%, #fff 42%, #fff 58%, transparent 58%),
		repeating-linear-gradient(0deg, #fff 0 0.4rem, transparent 0.4rem 0.8rem),
		repeating-linear-gradient(90deg, #fff 0 0.4rem, transparent 0.4rem 0.8rem);
}

.bsod-screen__meta {
	max-width: 33rem;
	font-size: 0.95rem;
	line-height: 1.7;
}

.bsod-screen__meta p {
	margin: 0 0 0.45rem;
}

.bsod-screen__hint {
	margin-top: 1.2rem !important;
	opacity: 0.82;
}

@media (max-width: 640px) {
	.bsod-screen {
		align-items: stretch;
	}

	.bsod-screen__content {
		width: 100%;
		padding:
			max(1rem, env(safe-area-inset-top))
			max(1rem, env(safe-area-inset-right))
			max(1.5rem, env(safe-area-inset-bottom))
			max(1rem, env(safe-area-inset-left));
	}

	.bsod-screen__face {
		margin-bottom: 0.4rem;
		font-size: clamp(3.25rem, 18vw, 5.25rem);
	}

	.bsod-screen__lead {
		max-width: none;
		font-size: clamp(1rem, 4.8vw, 1.35rem);
		line-height: 1.38;
	}

	.bsod-screen__progress {
		margin-top: 1.1rem;
		font-size: clamp(1rem, 4.2vw, 1.2rem);
	}

	.bsod-screen__footer {
		margin-top: 1.5rem;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.9rem;
	}

	.bsod-screen__qr {
		height: 5.75rem;
		width: 5.75rem;
	}

	.bsod-screen__meta {
		max-width: none;
		font-size: 0.88rem;
		line-height: 1.52;
		word-break: break-word;
	}

	.bsod-screen__meta p {
		margin-bottom: 0.35rem;
	}

	.bsod-screen__hint {
		margin-top: 0.8rem !important;
		font-size: 0.82rem;
	}
}

@media (max-width: 380px) {
	.bsod-screen__content {
		padding-inline: max(0.85rem, env(safe-area-inset-left));
	}

	.bsod-screen__meta {
		font-size: 0.8rem;
		line-height: 1.45;
	}
}
`;

let activeController: BsodController | null = null;

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: readonly T[]): T {
	return items[randomInt(0, items.length - 1)];
}

function createSessionId(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID().slice(0, 8).toUpperCase();
	}
	return Math.random().toString(16).slice(2, 10).toUpperCase();
}

function ensureStyle(): void {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement("style");
	style.id = STYLE_ID;
	style.textContent = STYLE_TEXT;
	document.head.appendChild(style);
}

class BsodController {
	private readonly force: boolean;
	private readonly scenario: FailureScenario;
	private readonly sessionId = createSessionId();
	private readonly timestamp = new Date().toISOString();
	private readonly progressSeed = randomInt(1000, 9999);

	private delayTimer: number | null = null;
	private progressTimer: number | null = null;
	private finishTimer: number | null = null;
	private cleanupKeydown: (() => void) | null = null;
	private overlay: HTMLElement | null = null;
	private progressLabel: HTMLElement | null = null;
	private destroyed = false;
	private didLockBodyScroll = false;
	private progress = 0;

	constructor(options: StartBsodEffectOptions = {}) {
		this.force = options.force ?? false;
		this.scenario = pickRandom(FAILURE_SCENARIOS);
	}

	start(): void {
		const delay = this.force ? BSOD_SHORT_DELAY : randomInt(BSOD_DELAY_MIN, BSOD_DELAY_MAX);
		this.delayTimer = window.setTimeout(() => {
			this.delayTimer = null;
			void this.show();
		}, delay);
	}

	destroy(): void {
		if (this.destroyed) return;
		this.destroyed = true;

		if (this.delayTimer !== null) {
			window.clearTimeout(this.delayTimer);
			this.delayTimer = null;
		}
		if (this.progressTimer !== null) {
			window.clearTimeout(this.progressTimer);
			this.progressTimer = null;
		}
		if (this.finishTimer !== null) {
			window.clearTimeout(this.finishTimer);
			this.finishTimer = null;
		}
		this.cleanupKeydown?.();
		this.cleanupKeydown = null;

		this.overlay?.remove();
		this.overlay = null;
		this.progressLabel = null;

		if (this.didLockBodyScroll) {
			unlockBodyScroll();
			this.didLockBodyScroll = false;
		}
	}

	private async show(): Promise<void> {
		if (this.destroyed || document.getElementById(OVERLAY_ID)) return;
		ensureStyle();

		const overlay = document.createElement("section");
		overlay.id = OVERLAY_ID;
		overlay.className = "bsod-screen";
		overlay.setAttribute("role", "dialog");
		overlay.setAttribute("aria-modal", "true");
		overlay.setAttribute("aria-label", "Blue screen simulation");
		overlay.innerHTML = `
			<div class="bsod-screen__content">
				<p class="bsod-screen__face">:(</p>
				<p class="bsod-screen__lead">Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.</p>
				<p class="bsod-screen__progress"><span data-bsod-progress>0</span>% complete</p>
				<div class="bsod-screen__footer">
					<canvas class="bsod-screen__qr" data-bsod-qr width="140" height="140"></canvas>
					<div class="bsod-screen__meta">
						<p>For more information about this issue and possible fixes, visit https://github.com/hi2ma-bu4/bio/issues</p>
						<p>If you call a support person, give them this info:</p>
						<p>Stop code: ${this.scenario.stopCode}</p>
						<p>What failed: ${this.scenario.failedModule}</p>
						<p>Failure bucket ID: ${this.scenario.bucketId}-${this.sessionId}</p>
						<p class="bsod-screen__hint">Press ESC to close this screen.</p>
					</div>
				</div>
			</div>
		`;

		document.body.appendChild(overlay);
		lockBodyScroll();
		this.didLockBodyScroll = true;
		this.overlay = overlay;
		this.progressLabel = overlay.querySelector<HTMLElement>("[data-bsod-progress]");
		this.cleanupKeydown = this.attachEscapeHandler();

		const qrCanvas = overlay.querySelector<HTMLCanvasElement>("[data-bsod-qr]");
		if (qrCanvas) {
			await this.renderQRCode(qrCanvas);
		}

		this.scheduleProgress();
	}

	private attachEscapeHandler(): () => void {
		const onKeydown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			this.destroy();
		};
		document.addEventListener("keydown", onKeydown, true);
		return () => {
			document.removeEventListener("keydown", onKeydown, true);
		};
	}

	private async renderQRCode(canvas: HTMLCanvasElement): Promise<void> {
		const payloadFactory = pickRandom(QR_PAYLOAD_FACTORIES);
		const payload = payloadFactory({
			...this.scenario,
			sessionId: this.sessionId,
			timestamp: this.timestamp,
			progressSeed: this.progressSeed,
		});

		try {
			await toCanvas(canvas, payload, {
				errorCorrectionLevel: "low",
				margin: 1,
				width: 140,
				color: {
					dark: "#FFFFFFFF",
					light: "#0078D700",
				},
			});
		} catch (error) {
			console.warn("Failed to render BSOD QR code", error);
			canvas.replaceWith(this.createQRPlaceholder());
		}
	}

	private createQRPlaceholder(): HTMLElement {
		const placeholder = document.createElement("div");
		placeholder.className = "bsod-screen__qr bsod-screen__qr--fallback";
		placeholder.setAttribute("aria-hidden", "true");
		return placeholder;
	}

	private scheduleProgress(): void {
		if (this.destroyed) return;
		const interval = randomInt(140, 420);
		this.progressTimer = window.setTimeout(() => {
			this.progressTimer = null;
			this.advanceProgress();
		}, interval);
	}

	private advanceProgress(): void {
		if (this.destroyed) return;
		const increment = this.progress < 24 ? randomInt(1, 4) : this.progress < 72 ? randomInt(1, 3) : randomInt(1, 2);
		this.progress = Math.min(100, this.progress + increment);
		if (this.progressLabel) {
			this.progressLabel.textContent = String(this.progress);
		}

		if (this.progress >= 100) {
			this.finishTimer = window.setTimeout(() => {
				this.finishTimer = null;
				this.destroy();
			}, 700);
			return;
		}

		this.scheduleProgress();
	}
}

export function startBsodEffect(options: StartBsodEffectOptions = {}): void {
	stopBsodEffect();
	activeController = new BsodController(options);
	activeController.start();
}

export function stopBsodEffect(): void {
	activeController?.destroy();
	activeController = null;
}
