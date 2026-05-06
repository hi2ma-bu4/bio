import { addStyle, removeStyle } from "../ui-utils";
import virusStyles from "./virus.css?inline";

interface ElementSnapshot {
	transform: string;
	filter: string;
	willChange: string;
}

interface VirusElementState {
	dx: number;
	dy: number;
	rot: number;
	hue: number;
	snapshot: ElementSnapshot;
}

const FPS = 30;
const TRAIL_LIFE = 320;
const MIN_ELEMENT_SIZE = 10;
const TRAIL_SELECTOR = "[data-virus-trail]";

const SKIPPED_TAGS = new Set(["HTML", "BODY", "HEAD", "SCRIPT", "STYLE", "NOSCRIPT", "LINK", "META", "TITLE", "MAIN"]);

/**
 * 指定した要素とその子孫からID属性を削除する
 * @param root - 対象のルート要素
 */
function removeElementIds(root: HTMLElement): void {
	root.removeAttribute("id");
	root.querySelectorAll<HTMLElement>("[id]").forEach((node) => node.removeAttribute("id"));
}

/**
 * ランダムに動かすエフェクトを制御するクラス
 */
class VirusEffectController {
	/** 要素ごとのアニメーション状態 */
	private readonly state = new Map<HTMLElement, VirusElementState>();
	/** 更新タイマーID */
	private timerId: number | null = null;
	/** 開始フラグ */
	private started = false;

	/**
	 * エフェクトを開始する
	 */
	start(): void {
		if (this.started) {
			this.stop();
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}

		this.started = true;
		addStyle(virusStyles, "virus-style");
		this.collectElements();
		window.addEventListener("resize", this.handleResize, { passive: true });
		window.addEventListener("orientationchange", this.handleResize);
		this.scheduleNextTick();
	}

	/**
	 * エフェクトを停止し、全要素を元の状態に復元する
	 */
	stop(): void {
		if (this.timerId != null) {
			window.clearTimeout(this.timerId);
			this.timerId = null;
		}

		window.removeEventListener("resize", this.handleResize);
		window.removeEventListener("orientationchange", this.handleResize);

		for (const [element, state] of this.state) {
			if (!element.isConnected) continue;
			element.style.transform = state.snapshot.transform;
			element.style.filter = state.snapshot.filter;
			element.style.willChange = state.snapshot.willChange;
		}

		this.state.clear();
		this.removeTrails();
		this.started = false;
		removeStyle("virus-style");
	}

	/** リサイズイベントハンドラ */
	private readonly handleResize = (): void => {
		this.collectElements();
	};

	/**
	 * アニメーション対象となる要素を収集する
	 */
	private collectElements(): void {
		for (const [element, state] of this.state) {
			if (!element.isConnected) continue;
			element.style.transform = state.snapshot.transform;
			element.style.filter = state.snapshot.filter;
			element.style.willChange = state.snapshot.willChange;
		}
		this.state.clear();

		document.body.querySelectorAll<HTMLElement>("*").forEach((element) => {
			if (!this.isEligible(element)) return;

			this.state.set(element, {
				dx: 0,
				dy: 0,
				rot: 0,
				hue: Math.random() * 360,
				snapshot: {
					transform: element.style.transform,
					filter: element.style.filter,
					willChange: element.style.willChange,
				},
			});

			element.style.willChange = "transform, filter";
		});
	}

	/**
	 * 要素がアニメーション対象として適切かどうかを判定する
	 * @param element - 対象の要素
	 * @returns 適切であれば true
	 */
	private isEligible(element: HTMLElement): boolean {
		if (SKIPPED_TAGS.has(element.tagName)) return false;
		if (element.matches(TRAIL_SELECTOR) || element.closest(TRAIL_SELECTOR)) return false;
		if (element.id === "bg-canvas" || element.id === "back-canvas-mini") return false;

		const rect = element.getBoundingClientRect();
		if (rect.width < MIN_ELEMENT_SIZE || rect.height < MIN_ELEMENT_SIZE) return false;
		if (rect.bottom < 0 || rect.right < 0) return false;
		if (rect.top > window.innerHeight || rect.left > window.innerWidth) return false;

		const style = getComputedStyle(element);
		if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
		if (style.position === "fixed" && rect.width >= window.innerWidth * 0.95 && rect.height >= window.innerHeight * 0.95) return false;

		return true;
	}

	/**
	 * 次の更新タイミングをスケジュールする
	 */
	private scheduleNextTick(): void {
		this.timerId = window.setTimeout(this.tick, 1000 / FPS);
	}

	/** 毎フレームの更新処理 */
	private readonly tick = (): void => {
		if (!this.started) return;

		const elements = Array.from(this.state.keys());
		if (elements.length === 0) {
			this.scheduleNextTick();
			return;
		}

		const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
		const activeRatio = coarsePointer ? 0.05 : 0.08;
		const moveStep = coarsePointer ? 3.5 : 6;
		const rotationStep = coarsePointer ? 0.8 : 1.2;
		const trailOpacity = coarsePointer ? 0.16 : 0.24;
		const maxOffsetX = Math.max(16, Math.min(window.innerWidth * 0.06, coarsePointer ? 22 : 36));
		const maxOffsetY = Math.max(16, Math.min(window.innerHeight * 0.05, coarsePointer ? 18 : 28));
		const maxRotation = coarsePointer ? 4 : 7;
		const activeCount = Math.max(1, Math.floor(elements.length * activeRatio));

		for (let i = 0; i < activeCount; i += 1) {
			const element = elements[Math.floor(Math.random() * elements.length)];
			if (!element) continue;

			const state = this.state.get(element);
			if (!state) continue;

			this.createTrail(element, state, trailOpacity);

			state.dx = this.clamp(state.dx + (Math.random() - 0.5) * moveStep, -maxOffsetX, maxOffsetX);
			state.dy = this.clamp(state.dy + (Math.random() - 0.5) * moveStep, -maxOffsetY, maxOffsetY);
			state.rot = this.clamp(state.rot + (Math.random() - 0.5) * rotationStep, -maxRotation, maxRotation);
			state.hue += (Math.random() - 0.5) * 20;

			element.style.transform = `translate3d(${state.dx.toFixed(2)}px, ${state.dy.toFixed(2)}px, 0) rotate(${state.rot.toFixed(2)}deg)`;
			element.style.filter = `hue-rotate(${state.hue.toFixed(2)}deg)`;
		}

		this.scheduleNextTick();
	};

	/**
	 * 残像（トレイル）エフェクトを作成する
	 * @param element - 対象の要素
	 * @param state - 現在の状態
	 * @param trailOpacity - 残像の透明度
	 */
	private createTrail(element: HTMLElement, state: VirusElementState, trailOpacity: number): void {
		const rect = element.getBoundingClientRect();
		if (rect.width < MIN_ELEMENT_SIZE || rect.height < MIN_ELEMENT_SIZE) return;

		const clone = element.cloneNode(true);
		if (!(clone instanceof HTMLElement)) return;

		removeElementIds(clone);
		clone.setAttribute("data-virus-trail", "");
		clone.setAttribute("aria-hidden", "true");

		clone.style.left = `${rect.left}px`;
		clone.style.top = `${rect.top}px`;
		clone.style.width = `${rect.width}px`;
		clone.style.height = `${rect.height}px`;
		clone.style.opacity = String(trailOpacity);
		clone.style.transform = `translate3d(${state.dx.toFixed(2)}px, ${state.dy.toFixed(2)}px, 0) rotate(${state.rot.toFixed(2)}deg)`;
		clone.style.filter = `hue-rotate(${state.hue.toFixed(2)}deg)`;

		document.body.appendChild(clone);

		const animation = clone.animate(
			[
				{ opacity: trailOpacity, filter: clone.style.filter, transform: clone.style.transform },
				{ opacity: 0, filter: `${clone.style.filter} blur(3px)`, transform: `${clone.style.transform} scale(1.01)` },
			],
			{ duration: TRAIL_LIFE, easing: "linear", fill: "forwards" },
		);

		animation.addEventListener(
			"finish",
			() => {
				clone.remove();
			},
			{ once: true },
		);
	}

	/**
	 * 全ての残像要素を削除する
	 */
	private removeTrails(): void {
		document.querySelectorAll<HTMLElement>(TRAIL_SELECTOR).forEach((element) => element.remove());
	}

	/**
	 * 値を指定範囲内に収める
	 * @param value - 元の値
	 * @param min - 最小値
	 * @param max - 最大値
	 * @returns 収められた値
	 */
	private clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}
}

let activeController: VirusEffectController | null = null;

/**
 * ウイルスエフェクトを開始する
 */
export function startVirusEffect(): void {
	activeController?.stop();
	activeController = new VirusEffectController();
	activeController.start();
}

/**
 * ウイルスエフェクトを停止する
 */
export function stopVirusEffect(): void {
	activeController?.stop();
	activeController = null;
}
