import { toCanvas } from "qrcode";

import { addStyle, lockBodyScroll, removeStyle, unlockBodyScroll } from "../ui-utils";
import bsodStyles from "./bsod.css?inline";

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

/**
 * ブラウザを検出する
 * @returns ブラウザ識別子
 */
function detectBrowser() {
	const ua = navigator.userAgent;

	if (ua.includes("Edg/")) return "msedge";
	if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "chrome";
	if (ua.includes("Firefox/")) return "firefox";
	if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "safari";

	return "browser";
}

/**
 * OSを検出する
 * @returns OS識別子
 */
function detectOS(): string {
	const ua = navigator.userAgent;

	if (ua.includes("Windows NT")) return "windows";
	if (ua.includes("Mac OS X")) return "mac";
	if (ua.includes("Linux")) return "linux";

	return "unknown";
}

/**
 * 実行ファイル名を取得する
 * @param base - ベース名
 * @returns OSに応じた実行ファイル名
 */
function getExecutableName(base: string): string {
	const os = detectOS();

	switch (os) {
		case "windows":
			return `${base}.exe`;
		case "mac":
			// mac は実際には .app だが、ネタとしてはこれが自然
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

let activeController: BsodController | null = null;

/**
 * 指定範囲のランダムな整数を生成する
 * @param min - 最小値
 * @param max - 最大値
 * @returns ランダムな整数
 */
function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 配列からランダムに要素を選択する
 * @param items - 要素の配列
 * @returns 選択された要素
 */
function pickRandom<T>(items: readonly T[]): T {
	return items[randomInt(0, items.length - 1)];
}

/**
 * セッションIDを生成する
 * @returns セッションID
 */
function createSessionId(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID().slice(0, 8).toUpperCase();
	}
	return Math.random().toString(16).slice(2, 10).toUpperCase();
}

/**
 * スタイルを適用する
 */
function ensureStyle(): void {
	addStyle(bsodStyles, STYLE_ID);
}

/**
 * BSODエフェクトを制御するクラス
 */
class BsodController {
	/** 強制表示フラグ */
	private readonly force: boolean;
	/** 失敗シナリオ */
	private readonly scenario: FailureScenario;
	/** セッションID */
	private readonly sessionId = createSessionId();
	/** タイムスタンプ */
	private readonly timestamp = new Date().toISOString();
	/** 進捗シード値 */
	private readonly progressSeed = randomInt(1000, 9999);

	/** 遅延タイマー */
	private delayTimer: number | null = null;
	/** 進捗タイマー */
	private progressTimer: number | null = null;
	/** 終了タイマー */
	private finishTimer: number | null = null;
	/** キーダウンイベント解除関数 */
	private cleanupKeydown: (() => void) | null = null;
	/** オーバーレイ要素 */
	private overlay: HTMLElement | null = null;
	/** 進捗表示ラベル */
	private progressLabel: HTMLElement | null = null;
	/** 破棄フラグ */
	private destroyed = false;
	/** ボディスクロールロックフラグ */
	private didLockBodyScroll = false;
	/** 現在の進捗率 */
	private progress = 0;

	/**
	 * コンストラクタ
	 * @param options - オプション
	 */
	constructor(options: StartBsodEffectOptions = {}) {
		this.force = options.force ?? false;
		this.scenario = pickRandom(FAILURE_SCENARIOS);
	}

	/**
	 * エフェクトを開始する
	 */
	start(): void {
		const delay = this.force ? BSOD_SHORT_DELAY : randomInt(BSOD_DELAY_MIN, BSOD_DELAY_MAX);
		this.delayTimer = window.setTimeout(() => {
			this.delayTimer = null;
			void this.show();
		}, delay);
	}

	/**
	 * エフェクトを破棄する
	 */
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
		removeStyle(STYLE_ID);

		if (this.didLockBodyScroll) {
			unlockBodyScroll();
			this.didLockBodyScroll = false;
		}
	}

	/**
	 * BSOD画面を表示する
	 */
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

	/**
	 * ESCキーのリスナーを登録する
	 * @returns 解除関数
	 */
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

	/**
	 * QRコードを描画する
	 * @param canvas - キャンバス要素
	 */
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

	/**
	 * QRコードのプレースホルダーを作成する
	 * @returns プレースホルダー要素
	 */
	private createQRPlaceholder(): HTMLElement {
		const placeholder = document.createElement("div");
		placeholder.className = "bsod-screen__qr bsod-screen__qr--fallback";
		placeholder.setAttribute("aria-hidden", "true");
		return placeholder;
	}

	/**
	 * 次の進捗更新をスケジュールする
	 */
	private scheduleProgress(): void {
		if (this.destroyed) return;
		const interval = randomInt(140, 420);
		this.progressTimer = window.setTimeout(() => {
			this.progressTimer = null;
			this.advanceProgress();
		}, interval);
	}

	/**
	 * 進捗を進める
	 */
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

/**
 * BSODエフェクトを開始する
 * @param options - オプション
 */
export function startBsodEffect(options: StartBsodEffectOptions = {}): void {
	stopBsodEffect();
	activeController = new BsodController(options);
	activeController.start();
}

/**
 * BSODエフェクトを停止する
 */
export function stopBsodEffect(): void {
	activeController?.destroy();
	activeController = null;
}
