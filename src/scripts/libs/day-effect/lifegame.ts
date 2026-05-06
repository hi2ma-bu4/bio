import { addStyle, removeStyle } from "../ui-utils";
import lifegameStyles from "./lifegame.css?inline";

const DEFAULT_CELL_SIZE = 6;
const TARGET_FPS = 30;
const DEFAULT_SPAWN_RATE = 0.3;
const POINTER_RADIUS = 2;

/**
 * ライフゲームエフェクトを制御するクラス
 */
class LifeGameEffect {
	/** 表示用キャンバス */
	private readonly canvas: HTMLCanvasElement;
	/** 表示用コンテキスト */
	private readonly context: CanvasRenderingContext2D;
	/** オフスクリーンキャンバス */
	private readonly offscreenCanvas: HTMLCanvasElement;
	/** オフスクリーンコンテキスト */
	private readonly offscreenContext: CanvasRenderingContext2D;
	/** フレーム更新間隔 */
	private readonly frameInterval: number;
	/** グリッドの列数 */
	private cols = 0;
	/** グリッドの行数 */
	private rows = 0;
	/** 現在のグリッドデータ */
	private grid = new Uint8Array(0);
	/** 次世代のグリッドデータ */
	private nextGrid = new Uint8Array(0);
	/** 描画用イメージデータ */
	private imageData: ImageData = new ImageData(1, 1);
	/** イメージデータのピクセル配列 */
	private pixels = this.imageData.data;
	/** requestAnimationFrameのID */
	private frameId: number | null = null;
	/** 最後にステップ実行した時間 */
	private lastStepTime = 0;
	/** 最後に状態が変化した時間 */
	private lastChangeTime = 0;
	/** 生存セル数 */
	private aliveCount = 0;
	/** ポインターが指しているセル座標 */
	private pointerCell: { x: number; y: number } | null = null;

	/**
	 * コンストラクタ
	 * @param container - キャンバスを配置するコンテナ要素
	 */
	constructor(private readonly container: HTMLElement) {
		const context = document.createElement("canvas").getContext("2d", { alpha: true });
		const offscreenContext = document.createElement("canvas").getContext("2d", { alpha: true });

		if (!context || !offscreenContext) {
			throw new Error("Canvas 2D context is not supported.");
		}

		this.canvas = context.canvas;
		this.context = context;
		this.offscreenCanvas = offscreenContext.canvas;
		this.offscreenContext = offscreenContext;
		this.frameInterval = 1000 / TARGET_FPS;

		this.canvas.id = "back-canvas-lifegame";
	}

	/**
	 * エフェクトを開始する
	 */
	start(): void {
		addStyle(lifegameStyles, "lifegame-style");
		this.container.appendChild(this.canvas);
		window.addEventListener("resize", this.handleResize, { passive: true });
		window.addEventListener("pointermove", this.handlePointerMove, { passive: true });
		window.addEventListener("pointerleave", this.handlePointerLeave, { passive: true });
		window.addEventListener("pointercancel", this.handlePointerLeave, { passive: true });

		this.resize(true);
		this.frameId = requestAnimationFrame(this.loop);
	}

	/**
	 * エフェクトを停止する
	 */
	stop(): void {
		if (this.frameId != null) {
			cancelAnimationFrame(this.frameId);
			this.frameId = null;
		}

		window.removeEventListener("resize", this.handleResize);
		window.removeEventListener("pointermove", this.handlePointerMove);
		window.removeEventListener("pointerleave", this.handlePointerLeave);
		window.removeEventListener("pointercancel", this.handlePointerLeave);
		this.pointerCell = null;
		this.canvas.remove();
		removeStyle("lifegame-style");
	}

	/** リサイズイベントハンドラ */
	private readonly handleResize = (): void => {
		this.resize(true);
	};

	/** ポインター移動イベントハンドラ */
	private readonly handlePointerMove = (event: PointerEvent): void => {
		if (this.cols <= 0 || this.rows <= 0) return;

		this.pointerCell = {
			x: Math.floor(event.clientX / DEFAULT_CELL_SIZE),
			y: Math.floor(event.clientY / DEFAULT_CELL_SIZE),
		};
	};

	/** ポインター離脱イベントハンドラ */
	private readonly handlePointerLeave = (): void => {
		this.pointerCell = null;
	};

	/** アニメーションループ */
	private readonly loop = (time: number): void => {
		if (time - this.lastStepTime >= this.frameInterval) {
			this.step();
			this.draw(time);
			this.lastStepTime = time;
		}

		this.frameId = requestAnimationFrame(this.loop);
	};

	/**
	 * 画面サイズに合わせてリサイズする
	 * @param preserve - 現在の状態を維持するかどうか
	 */
	private resize(preserve: boolean): void {
		const width = Math.max(window.innerWidth, 1);
		const height = Math.max(window.innerHeight, 1);

		this.canvas.width = width;
		this.canvas.height = height;

		this.initGrid(width, height, preserve);
	}

	/**
	 * グリッドを初期化する
	 * @param width - 横幅
	 * @param height - 縦幅
	 * @param preserve - 現在の状態を維持するかどうか
	 */
	private initGrid(width: number, height: number, preserve: boolean): void {
		const newCols = Math.max(1, Math.floor(width / DEFAULT_CELL_SIZE));
		const newRows = Math.max(1, Math.floor(height / DEFAULT_CELL_SIZE));
		const newGrid = new Uint8Array(newCols * newRows);

		if (preserve && this.cols > 0 && this.rows > 0 && this.grid.length > 0) {
			this.copyCenteredGrid(newGrid, newCols, newRows);
		} else {
			this.seedRandom(newGrid);
		}

		this.cols = newCols;
		this.rows = newRows;
		this.grid = newGrid;
		this.nextGrid = new Uint8Array(newGrid.length);

		this.offscreenCanvas.width = this.cols;
		this.offscreenCanvas.height = this.rows;
		this.imageData = this.offscreenContext.createImageData(this.cols, this.rows);
		this.pixels = this.imageData.data;
	}

	/**
	 * 現在のグリッドを新しいグリッドの中央にコピーする
	 * @param target - コピー先のグリッド
	 * @param targetCols - コピー先の列数
	 * @param targetRows - コピー先の行数
	 */
	private copyCenteredGrid(target: Uint8Array, targetCols: number, targetRows: number): void {
		const copyCols = Math.min(this.cols, targetCols);
		const copyRows = Math.min(this.rows, targetRows);
		const sourceOffsetX = Math.max(0, Math.floor((this.cols - copyCols) / 2));
		const sourceOffsetY = Math.max(0, Math.floor((this.rows - copyRows) / 2));
		const targetOffsetX = Math.max(0, Math.floor((targetCols - copyCols) / 2));
		const targetOffsetY = Math.max(0, Math.floor((targetRows - copyRows) / 2));

		for (let y = 0; y < copyRows; y += 1) {
			const sourceRow = (y + sourceOffsetY) * this.cols;
			const targetRow = (y + targetOffsetY) * targetCols;

			for (let x = 0; x < copyCols; x += 1) {
				target[targetRow + targetOffsetX + x] = this.grid[sourceRow + sourceOffsetX + x] ?? 0;
			}
		}
	}

	/**
	 * グリッドにランダムな初期値を設定する
	 * @param target - 対象のグリッド
	 */
	private seedRandom(target: Uint8Array): void {
		for (let i = 0; i < target.length; i += 1) {
			target[i] = Math.random() > 1 - DEFAULT_SPAWN_RATE ? 1 : 0;
		}
	}

	/**
	 * 次世代のグリッドを計算する
	 */
	private step(): void {
		let aliveCounter = 0;

		for (let y = 0; y < this.rows; y += 1) {
			const north = y === 0 ? this.rows - 1 : y - 1;
			const south = y === this.rows - 1 ? 0 : y + 1;
			const row = y * this.cols;
			const northRow = north * this.cols;
			const southRow = south * this.cols;

			for (let x = 0; x < this.cols; x += 1) {
				const west = x === 0 ? this.cols - 1 : x - 1;
				const east = x === this.cols - 1 ? 0 : x + 1;
				const index = row + x;
				const neighbors = this.grid[northRow + west]! + this.grid[northRow + x]! + this.grid[northRow + east]! + this.grid[row + west]! + this.grid[row + east]! + this.grid[southRow + west]! + this.grid[southRow + x]! + this.grid[southRow + east]!;
				const alive = this.grid[index] === 1;

				// HighLife (B36/S23)
				this.nextGrid[index] = alive ? (neighbors === 2 || neighbors === 3 ? 1 : 0) : neighbors === 3 || neighbors === 6 ? 1 : 0;

				if (this.nextGrid[index] === 1) aliveCounter++;
			}
		}

		this.applyPointerInfluence(this.nextGrid);
		[this.grid, this.nextGrid] = [this.nextGrid, this.grid];

		// 変化検知
		if (aliveCounter !== this.aliveCount) {
			this.aliveCount = aliveCounter;
			this.lastChangeTime = performance.now();
		} else {
			// 5秒停止でリセット
			if (performance.now() - this.lastChangeTime > 5000) {
				this.seedRandom(this.grid);
				this.lastChangeTime = performance.now();
			}
		}
	}

	/**
	 * ポインター周辺のセルを強制的に生存させる
	 * @param target - 対象のグリッド
	 */
	private applyPointerInfluence(target: Uint8Array): void {
		if (!this.pointerCell) return;

		const { x: pointerX, y: pointerY } = this.pointerCell;
		for (let deltaY = -POINTER_RADIUS; deltaY <= POINTER_RADIUS; deltaY += 1) {
			const y = pointerY + deltaY;
			if (y < 0 || y >= this.rows) continue;

			const row = y * this.cols;
			for (let deltaX = -POINTER_RADIUS; deltaX <= POINTER_RADIUS; deltaX += 1) {
				const x = pointerX + deltaX;
				if (x < 0 || x >= this.cols) continue;

				target[row + x] = 1;
			}
		}
	}

	/**
	 * グリッドをキャンバスに描画する
	 * @param time - 現在時刻
	 */
	private draw(time: number): void {
		this.context.fillStyle = "rgba(10, 3, 18, 0.18)";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		const t = time * 0.002;
		for (let i = 0; i < this.grid.length; i += 1) {
			const pixelIndex = i * 4;
			if (this.grid[i] === 1) {
				this.pixels[pixelIndex] = 128 + Math.sin(t) * 127;
				this.pixels[pixelIndex + 1] = 128 + Math.sin(t + 2) * 127;
				this.pixels[pixelIndex + 2] = 128 + Math.sin(t + 4) * 127;
				this.pixels[pixelIndex + 3] = 255;
			} else {
				this.pixels[pixelIndex + 3] = 0;
			}
		}

		this.offscreenContext.putImageData(this.imageData, 0, 0);
		this.context.imageSmoothingEnabled = false;
		this.context.drawImage(this.offscreenCanvas, 0, 0, this.canvas.width, this.canvas.height);
	}
}

let activeEffect: LifeGameEffect | null = null;

/**
 * キャンバスを配置するコンテナ要素を取得する
 * @returns コンテナ要素
 */
function resolveContainer(): HTMLElement | null {
	return document.getElementById("bg-canvas") ?? document.body;
}

/**
 * ライフゲームエフェクトを開始する
 */
export function startLifeGameEffect(): void {
	stopLifeGameEffect();

	const container = resolveContainer();
	if (!container) return;

	activeEffect = new LifeGameEffect(container);
	activeEffect.start();
}

/**
 * ライフゲームエフェクトを停止する
 */
export function stopLifeGameEffect(): void {
	activeEffect?.stop();
	activeEffect = null;
}
