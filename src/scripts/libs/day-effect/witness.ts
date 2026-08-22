import { addStyle, removeStyle } from "../ui-utils";
import witnessStyles from "./witness.css?inline";

/** 2次元座標点 */
interface Point {
	/** X座標 */
	x: number;
	/** Y座標 */
	y: number;
}

/** パーティクルオブジェクト */
interface Particle {
	/** X座標 */
	x: number;
	/** Y座標 */
	y: number;
	/** X方向速度 */
	vx: number;
	/** Y方向速度 */
	vy: number;
	/** サイズ */
	size: number;
	/** 色 */
	color: string;
	/** 不透明度 */
	alpha: number;
	/** 現在の生存フレーム */
	life: number;
	/** 最大生存フレーム */
	maxLife: number;
	/** 波動アニメーション用位相 */
	phase: number;
	/** 移動速度 */
	speed: number;
}

/**
 * 『The Witness』スタイルの環境パズルを制御するクラス
 */
class WitnessPuzzle {
	/** コンテナ要素 */
	private container: HTMLDivElement | null = null;
	/** キャンバス要素 */
	private canvas: HTMLCanvasElement | null = null;
	/** 描画コンテキスト */
	private ctx: CanvasRenderingContext2D | null = null;

	/** 手前の半円要素 */
	private fgSemi: HTMLDivElement | null = null;
	/** 奥の半円要素 */
	private bgSemi: HTMLDivElement | null = null;
	/** ゴールノード要素 */
	private goalNodeEl: HTMLDivElement | null = null;

	/** 位置合わせ完了フラグ */
	private isAligned = false;
	/** ドラッグ中フラグ */
	private isDragging = false;
	/** パズルクリアフラグ */
	private isCompleted = false;

	/** 現在ドラッグ描画中のパス座標配列 */
	private currentPathPoints: Point[] = [];
	/** 目標となるパズルのルートノード配列 */
	private targetPathNodes: Point[] = [];
	/** 現在の進行ノードインデックス */
	private currentProgressIndex = 0;
	/** 現在のドラッグポインタ位置 */
	private currentDragPos: Point = { x: 0, y: 0 };

	/** パス上のキラキラ粒子リスト */
	private particles: Particle[] = [];
	/** ゴール後の追従蛇パーティクルリスト */
	private snakeParticles: Particle[] = [];

	/** アニメーションフレームID */
	private animFrameId: number | null = null;

	/** スクロールイベントハンドラ */
	private onScrollHandler: (() => void) | null = null;
	/** リサイズイベントハンドラ */
	private onResizeHandler: (() => void) | null = null;
	/** ポインタダウンハンドラ */
	private onPointerDownHandler: ((e: PointerEvent) => void) | null = null;
	/** ポインタムーブハンドラ */
	private onPointerMoveHandler: ((e: PointerEvent) => void) | null = null;
	/** ポインタアップハンドラ */
	private onPointerUpHandler: ((e: PointerEvent) => void) | null = null;

	/**
	 * エフェクトを開始する
	 */
	public start(): void {
		if (this.container) return;

		addStyle(witnessStyles, "witness-style");

		// DOMコンテナとCanvas作成
		this.container = document.createElement("div");
		this.container.id = "witness-puzzle-container";
		this.container.className = "witness-container";

		this.canvas = document.createElement("canvas");
		this.canvas.className = "witness-canvas";
		this.container.appendChild(this.canvas);
		document.body.appendChild(this.container);

		this.ctx = this.canvas.getContext("2d");
		this.resizeCanvas();

		// カモフラージュ半円要素の作成と配置
		this.createSemiCircles();
		this.createGoalNode();

		// イベントリスナーの準備
		this.setupEventListeners();

		// 初期位置のチェックとパス生成
		this.checkAlignmentAndBuildPath();

		// アニメーションループ開始
		this.loop();
	}

	/**
	 * キャンバスサイズ設定
	 */
	private resizeCanvas(): void {
		if (this.canvas) {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		}
	}

	/**
	 * 手前（Z-index高）と奥（Z-index低）の半円パーツを作成
	 */
	private createSemiCircles(): void {
		// 手前要素: Floating Header または mobile menu や 画面上部に固定
		this.fgSemi = document.createElement("div");
		this.fgSemi.className = "witness-fg-semicircle";
		this.fgSemi.setAttribute("title", "Gimmick");

		// 奥要素: メインコンテンツ領域内の特定の要素の縁に溶け込ませる
		this.bgSemi = document.createElement("div");
		this.bgSemi.className = "witness-bg-semicircle";

		// 手前要素の配置先を探す（FloatingHeader または Top ナビゲーション）
		const headerNav = document.querySelector("#floating-header nav") || document.querySelector("header nav");
		if (headerNav) {
			headerNav.appendChild(this.fgSemi);
			// ヘッダー内の適度な右寄り位置にインライン風配置
			this.fgSemi.style.position = "relative";
			this.fgSemi.style.display = "inline-block";
			this.fgSemi.style.top = "6px";
			this.fgSemi.style.margin = "0 12px";
		} else {
			document.body.appendChild(this.fgSemi);
			this.fgSemi.style.position = "fixed";
			this.fgSemi.style.top = "20px";
			this.fgSemi.style.right = "80px";
		}

		// 奥要素の配置先を探す（メインコンテンツ内の最初のカードや見出しなど）
		const mainTarget = document.querySelector("main h1, main section, main article") || document.querySelector("main");
		if (mainTarget) {
			const targetEl = mainTarget as HTMLElement;
			if (getComputedStyle(targetEl).position === "static") {
				targetEl.style.position = "relative";
			}
			targetEl.appendChild(this.bgSemi);
			this.bgSemi.style.position = "absolute";
			this.bgSemi.style.top = "180px"; // スクロール時に合体するYオフセット

			// 手前要素のX座標に合わせて奥要素のX位置を調整
			const fgRect = this.fgSemi.getBoundingClientRect();
			const targetRect = targetEl.getBoundingClientRect();
			const relativeLeft = fgRect.left - targetRect.left;
			this.bgSemi.style.left = `${relativeLeft}px`;
		} else {
			document.body.appendChild(this.bgSemi);
			this.bgSemi.style.position = "absolute";
			this.bgSemi.style.top = "250px";
			this.bgSemi.style.left = `${this.fgSemi.getBoundingClientRect().left}px`;
		}
	}

	/**
	 * ゴールノードの表示要素を作成
	 */
	private createGoalNode(): void {
		this.goalNodeEl = document.createElement("div");
		this.goalNodeEl.className = "witness-goal-node";
		document.body.appendChild(this.goalNodeEl);
	}

	/**
	 * スクロール位置と合体判定
	 */
	private checkAlignmentAndBuildPath(): void {
		if (!this.fgSemi || !this.bgSemi) return;

		if (!this.isDragging) {
			const fgR = this.fgSemi.getBoundingClientRect();
			const parent = this.bgSemi.offsetParent as HTMLElement;
			if (parent) {
				const parentR = parent.getBoundingClientRect();
				this.bgSemi.style.left = `${fgR.left - parentR.left}px`;
			}
		}

		const fgRect = this.fgSemi.getBoundingClientRect();
		const bgRect = this.bgSemi.getBoundingClientRect();

		// 手前の半円の下端と、奥の半円の上端がぴったり接して正円になるか判定 (許容誤差 ±6px)
		const dx = Math.abs(fgRect.left - bgRect.left);
		const dy = Math.abs(fgRect.bottom - bgRect.top);

		const tolerance = 8;
		const aligned = dx <= tolerance && dy <= tolerance;

		if (aligned !== this.isAligned) {
			this.isAligned = aligned;
			if (this.container) {
				if (this.isAligned) {
					this.container.classList.add("witness-aligned");
				} else {
					this.container.classList.remove("witness-aligned");
				}
			}
		}

		// スクロール等に応じてパスノードの位置を更新（合体時のビューポート座標基準）
		this.buildPuzzlePath(fgRect, bgRect);
	}

	/**
	 * パズルのルート（複数レイヤー・要素の縁をなぞるランダム＋自然なパス）の構築
	 * @param fgRect - 手前要素の矩形情報
	 * @param bgRect - 奥要素の矩形情報
	 */
	private buildPuzzlePath(fgRect: DOMRect, bgRect: DOMRect): void {
		if (this.isDragging) return; // ドラッグ中はノード再構築しない

		// スタート地点: 合体した円の中心
		const startX = fgRect.left + fgRect.width / 2;
		const startY = (fgRect.bottom + bgRect.top) / 2;

		const nodes: Point[] = [{ x: startX, y: startY }];

		// ページの要素（カード、ボタン、ナビ等）の縁をなぞるようにノードを経由させる
		const contentElements = Array.from(document.querySelectorAll("main article, main section, main .card, main h2, nav a"));

		if (contentElements.length >= 2) {
			// 一部の要素の角や縁の座標を取得
			const el1 = contentElements[Math.floor(contentElements.length * 0.3)] as HTMLElement;
			const el2 = contentElements[Math.floor(contentElements.length * 0.7)] as HTMLElement;

			const r1 = el1.getBoundingClientRect();
			const r2 = el2.getBoundingClientRect();

			// 縁に沿うノード1
			nodes.push({ x: r1.left, y: startY });
			nodes.push({ x: r1.left, y: r1.top + r1.height / 2 });

			// 縁に沿うノード2
			nodes.push({ x: r2.right, y: r1.top + r1.height / 2 });
			nodes.push({ x: r2.right, y: r2.bottom });
		} else {
			// バックアップ用パスノード
			nodes.push({ x: startX + 120, y: startY });
			nodes.push({ x: startX + 120, y: startY + 180 });
			nodes.push({ x: startX - 80, y: startY + 180 });
		}

		// ゴール地点（ページの右側または下側の目立たない要素の端）
		const lastNode = nodes[nodes.length - 1];
		const goalPoint = { x: lastNode.x, y: lastNode.y + 100 };
		nodes.push(goalPoint);

		this.targetPathNodes = nodes;

		// ゴールノードUI要素の位置更新
		if (this.goalNodeEl) {
			this.goalNodeEl.style.left = `${goalPoint.x}px`;
			this.goalNodeEl.style.top = `${goalPoint.y}px`;
			if (this.isAligned && !this.isCompleted) {
				this.goalNodeEl.classList.add("active");
			} else {
				this.goalNodeEl.classList.remove("active");
			}
		}
	}

	/**
	 * イベントリスナーのセットアップ
	 */
	private setupEventListeners(): void {
		this.onScrollHandler = () => this.checkAlignmentAndBuildPath();
		this.onResizeHandler = () => {
			this.resizeCanvas();
			this.checkAlignmentAndBuildPath();
		};

		window.addEventListener("scroll", this.onScrollHandler, { passive: true });
		window.addEventListener("resize", this.onResizeHandler);

		this.onPointerDownHandler = (e: PointerEvent) => this.handlePointerDown(e);
		this.onPointerMoveHandler = (e: PointerEvent) => this.handlePointerMove(e);
		this.onPointerUpHandler = (e: PointerEvent) => this.handlePointerUp(e);

		window.addEventListener("pointerdown", this.onPointerDownHandler);
		window.addEventListener("pointermove", this.onPointerMoveHandler);
		window.addEventListener("pointerup", this.onPointerUpHandler);
	}

	/**
	 * ドラッグ開始ハンドラ
	 * @param e - ポインタイベント
	 */
	private handlePointerDown(e: PointerEvent): void {
		this.checkAlignmentAndBuildPath();
		if (!this.isAligned || this.isCompleted || this.targetPathNodes.length === 0) return;

		const startNode = this.targetPathNodes[0];
		const dist = Math.hypot(e.clientX - startNode.x, e.clientY - startNode.y);

		// スタート円の中心付近（半径25px以内）でのみドラッグを開始
		if (dist <= 25) {
			this.isDragging = true;
			this.currentPathPoints = [startNode];
			this.currentProgressIndex = 0;
			this.currentDragPos = { x: e.clientX, y: e.clientY };

			if (this.canvas) {
				this.canvas.classList.add("interactive");
			}

			e.preventDefault();
		}
	}

	/**
	 * ドラッグ移動ハンドラ
	 * @param e - ポインタイベント
	 */
	private handlePointerMove(e: PointerEvent): void {
		if (!this.isDragging || this.isCompleted) return;

		e.preventDefault();
		const mouse = { x: e.clientX, y: e.clientY };
		this.currentDragPos = mouse;

		// パス進行チェック
		const nextTarget = this.targetPathNodes[this.currentProgressIndex + 1];
		if (nextTarget) {
			const prevTarget = this.targetPathNodes[this.currentProgressIndex];

			// 線分 prevTarget -> nextTarget への投影位置を計算
			const projected = this.getProjectedPoint(mouse, prevTarget, nextTarget);
			const distToLine = Math.hypot(mouse.x - projected.x, mouse.y - projected.y);

			// パスの許容線幅（35px以内）であれば進行を許可
			if (distToLine < 35) {
				this.currentPathPoints = [...this.targetPathNodes.slice(0, this.currentProgressIndex + 1), projected];

				// 次のノードに到達したか
				const distToNext = Math.hypot(projected.x - nextTarget.x, projected.y - nextTarget.y);
				if (distToNext < 15) {
					this.currentProgressIndex++;
					if (this.currentProgressIndex >= this.targetPathNodes.length - 1) {
						// ゴール到達準備
						if (this.goalNodeEl) {
							this.goalNodeEl.classList.add("flashing");
						}
					}
				}
			}
		}
	}

	/**
	 * ドラッグ終了ハンドラ
	 * @param e - ポインタイベント
	 */
	private handlePointerUp(e: PointerEvent): void {
		if (!this.isDragging) return;

		this.isDragging = false;
		if (this.canvas) {
			this.canvas.classList.remove("interactive");
		}

		// ゴール地点に達しているか判定
		const goalNode = this.targetPathNodes[this.targetPathNodes.length - 1];
		if (goalNode && this.currentProgressIndex >= this.targetPathNodes.length - 1) {
			const distToGoal = Math.hypot(this.currentDragPos.x - goalNode.x, this.currentDragPos.y - goalNode.y);
			if (distToGoal <= 30) {
				this.triggerGoalCompletion();
				return;
			}
		}

		// ゴール未達成の場合はリセット
		this.currentPathPoints = [];
		this.currentProgressIndex = 0;
		if (this.goalNodeEl) {
			this.goalNodeEl.classList.remove("flashing");
		}
	}

	/**
	 * 点から線分への最短投影点を求める
	 * @param p - 入力点
	 * @param a - 線分始点
	 * @param b - 線分終点
	 * @returns 線分上の最短投影座標
	 */
	private getProjectedPoint(p: Point, a: Point, b: Point): Point {
		const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
		if (l2 === 0) return a;
		let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
		t = Math.max(0, Math.min(1, t));
		return {
			x: a.x + t * (b.x - a.x),
			y: a.y + t * (b.y - a.y),
		};
	}

	/**
	 * ゴール達成演出（キラキラが魔法の蛇のようにロゴへ吸い込まれる）
	 */
	private triggerGoalCompletion(): void {
		this.isCompleted = true;
		if (this.goalNodeEl) {
			this.goalNodeEl.classList.remove("active", "flashing");
		}

		// 描いたパス上の各点から「魔法の蛇」パーティクル群を生成
		const totalParticles = 60;
		this.snakeParticles = [];

		for (let i = 0; i < totalParticles; i++) {
			// パスに沿った初期位置
			const pathRatio = i / totalParticles;
			const samplePos = this.getPointAlongPath(pathRatio);

			this.snakeParticles.push({
				x: samplePos.x,
				y: samplePos.y,
				vx: 0,
				vy: 0,
				size: Math.random() * 4 + 2,
				color: `hsl(${40 + Math.random() * 30}, 100%, ${70 + Math.random() * 25}%)`,
				alpha: 1,
				life: 0,
				maxLife: 180, // 約3秒間
				phase: i * 0.2, // 波動の位相ずれ
				speed: 2 + Math.random() * 2,
			});
		}
	}

	/**
	 * パス上の指定比率 (0~1) の座標をサンプリング
	 * @param ratio - サンプリング位置比率 (0~1)
	 * @returns パス上の座標
	 */
	private getPointAlongPath(ratio: number): Point {
		if (this.currentPathPoints.length < 2) {
			return this.currentPathPoints[0] || { x: 0, y: 0 };
		}
		const idx = Math.min(Math.floor(ratio * (this.currentPathPoints.length - 1)), this.currentPathPoints.length - 2);
		const p1 = this.currentPathPoints[idx];
		const p2 = this.currentPathPoints[idx + 1];
		const subRatio = ratio * (this.currentPathPoints.length - 1) - idx;

		return {
			x: p1.x + (p2.x - p1.x) * subRatio,
			y: p1.y + (p2.y - p1.y) * subRatio,
		};
	}

	/**
	 * アニメーションメインループ
	 */
	private loop(): void {
		if (!this.ctx || !this.canvas) return;

		if (!this.isDragging && !this.isCompleted) {
			this.checkAlignmentAndBuildPath();
		}

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// 1. ドラッグ中または完了時のパズルルート描画（キラキラ輝く縁アニメーション）
		if (this.currentPathPoints.length >= 2) {
			this.renderSparklePath();
		}

		// 2. ゴール後の「魔法の蛇」ロゴ追従アニメーション描画
		if (this.isCompleted && this.snakeParticles.length > 0) {
			this.renderSnakeParticles();
		}

		this.animFrameId = requestAnimationFrame(() => this.loop());
	}

	/**
	 * 通ったパズルのルートの縁がキラキラ輝く描画
	 */
	private renderSparklePath(): void {
		if (!this.ctx) return;

		this.ctx.save();

		// 発光の外枠ライン
		this.ctx.beginPath();
		this.ctx.moveTo(this.currentPathPoints[0].x, this.currentPathPoints[0].y);
		for (let i = 1; i < this.currentPathPoints.length; i++) {
			this.ctx.lineTo(this.currentPathPoints[i].x, this.currentPathPoints[i].y);
		}

		const time = Date.now() / 200;
		const glowWidth = 12 + Math.sin(time) * 3;

		this.ctx.strokeStyle = "rgba(255, 210, 100, 0.4)";
		this.ctx.lineWidth = glowWidth;
		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
		this.ctx.shadowColor = "rgba(255, 200, 80, 0.8)";
		this.ctx.shadowBlur = 15;
		this.ctx.stroke();

		// 核心の明るい白金ライン
		this.ctx.beginPath();
		this.ctx.moveTo(this.currentPathPoints[0].x, this.currentPathPoints[0].y);
		for (let i = 1; i < this.currentPathPoints.length; i++) {
			this.ctx.lineTo(this.currentPathPoints[i].x, this.currentPathPoints[i].y);
		}
		this.ctx.strokeStyle = "rgba(255, 255, 240, 0.95)";
		this.ctx.lineWidth = 5;
		this.ctx.stroke();

		// パス上のキラキラ粒子ランダム描画
		if (Math.random() < 0.6) {
			const randomPt = this.currentPathPoints[Math.floor(Math.random() * this.currentPathPoints.length)];
			this.particles.push({
				x: randomPt.x + (Math.random() - 0.5) * 10,
				y: randomPt.y + (Math.random() - 0.5) * 10,
				vx: (Math.random() - 0.5) * 0.8,
				vy: (Math.random() - 0.5) * 0.8,
				size: Math.random() * 3 + 1,
				color: "#fff3a0",
				alpha: 1,
				life: 0,
				maxLife: 30,
				phase: 0,
				speed: 0,
			});
		}

		// パス粒子の更新・描画
		this.particles = this.particles.filter((p) => {
			p.x += p.vx;
			p.y += p.vy;
			p.life++;
			p.alpha = 1 - p.life / p.maxLife;

			this.ctx!.fillStyle = p.color;
			this.ctx!.globalAlpha = Math.max(0, p.alpha);
			this.ctx!.beginPath();
			this.ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			this.ctx!.fill();

			return p.life < p.maxLife;
		});

		this.ctx.restore();
	}

	/**
	 * RPGの仲間のように揺らぎながらロゴへ向かって追従する魔法の蛇アニメーション
	 */
	private renderSnakeParticles(): void {
		if (!this.ctx) return;

		const logoEl = document.querySelector("#logo") || document.querySelector("#floating-logo") || document.querySelector("header");
		const logoRect = logoEl ? logoEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: 20, width: 100, height: 40 };
		const logoTarget: Point = {
			x: logoRect.left + logoRect.width / 2,
			y: logoRect.top + logoRect.height / 2,
		};

		this.ctx.save();

		this.snakeParticles = this.snakeParticles.filter((p) => {
			p.life++;

			// ロゴ方向のベクトル
			const dx = logoTarget.x - p.x;
			const dy = logoTarget.y - p.y;
			const dist = Math.hypot(dx, dy);

			if (dist > 10) {
				// 基本の追いかけ移動
				const angle = Math.atan2(dy, dx);

				// RPGの仲間の揺らぎ（サイン波のうねり・横揺れ）
				p.phase += 0.08;
				const waveOffset = Math.sin(p.phase) * 6;
				const perpAngle = angle + Math.PI / 2;

				p.x += Math.cos(angle) * p.speed + Math.cos(perpAngle) * waveOffset;
				p.y += Math.sin(angle) * p.speed + Math.sin(perpAngle) * waveOffset;
			} else {
				// ロゴに到達
				p.alpha -= 0.05;
			}

			// 描画
			this.ctx!.fillStyle = p.color;
			this.ctx!.shadowColor = p.color;
			this.ctx!.shadowBlur = 10;
			this.ctx!.globalAlpha = Math.max(0, p.alpha);

			this.ctx!.beginPath();
			this.ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			this.ctx!.fill();

			return p.alpha > 0 && p.life < p.maxLife;
		});

		this.ctx.restore();
	}

	/**
	 * エフェクトを停止し、全要素・イベントリスナーをクリーンアップする
	 */
	public stop(): void {
		if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

		if (this.onScrollHandler) window.removeEventListener("scroll", this.onScrollHandler);
		if (this.onResizeHandler) window.removeEventListener("resize", this.onResizeHandler);
		if (this.onPointerDownHandler) window.removeEventListener("pointerdown", this.onPointerDownHandler);
		if (this.onPointerMoveHandler) window.removeEventListener("pointermove", this.onPointerMoveHandler);
		if (this.onPointerUpHandler) window.removeEventListener("pointerup", this.onPointerUpHandler);

		this.fgSemi?.remove();
		this.bgSemi?.remove();
		this.goalNodeEl?.remove();
		this.container?.remove();

		this.fgSemi = null;
		this.bgSemi = null;
		this.goalNodeEl = null;
		this.container = null;
		this.canvas = null;
		this.ctx = null;
		this.particles = [];
		this.snakeParticles = [];

		removeStyle("witness-style");
	}
}

/** WitnessPuzzle インスタンス */
export const witnessPuzzle = new WitnessPuzzle();
/** エフェクト開始関数 */
export const startWitnessEffect = () => witnessPuzzle.start();
/** エフェクト停止関数 */
export const stopWitnessEffect = () => witnessPuzzle.stop();
