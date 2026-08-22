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

	/** トラックの縁のキラキラ粒子リスト */
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
	 * 既存のレイアウトを壊さないよう、絶対配置/固定配置のオーバーレイとして注入する
	 */
	private createSemiCircles(): void {
		// 手前要素: ヘッダー/ナビゲーション領域に重ねて固定配置
		this.fgSemi = document.createElement("div");
		this.fgSemi.className = "witness-fg-semicircle";
		document.body.appendChild(this.fgSemi);

		// 奥要素: ドキュメント本体の要素領域に重ねて配置
		this.bgSemi = document.createElement("div");
		this.bgSemi.className = "witness-bg-semicircle";
		document.body.appendChild(this.bgSemi);

		this.updateSemiCirclePositions();
	}

	/**
	 * 半円要素のスクリーン位置を更新
	 */
	private updateSemiCirclePositions(): void {
		if (!this.fgSemi || !this.bgSemi) return;

		// 手前の半円はヘッダーバーまたはビューポート上部固定
		const headerEl = document.querySelector("#floating-header, header");
		if (headerEl) {
			const hRect = headerEl.getBoundingClientRect();
			this.fgSemi.style.position = "fixed";
			this.fgSemi.style.top = `${Math.max(10, hRect.bottom - 16)}px`;
			this.fgSemi.style.left = `${hRect.left + hRect.width * 0.75}px`;
		} else {
			this.fgSemi.style.position = "fixed";
			this.fgSemi.style.top = "24px";
			this.fgSemi.style.left = "75%";
		}

		// 奥の半円はメインコンテンツの要素（スクロール連動）
		const fgRect = this.fgSemi.getBoundingClientRect();
		const mainEl = document.querySelector("main article, main section, main");
		if (mainEl) {
			const mRect = mainEl.getBoundingClientRect();
			const absoluteTop = window.scrollY + mRect.top + 280; // スクロールで一致するターゲットY
			this.bgSemi.style.position = "absolute";
			this.bgSemi.style.top = `${absoluteTop}px`;
			this.bgSemi.style.left = `${fgRect.left}px`;
		} else {
			this.bgSemi.style.position = "absolute";
			this.bgSemi.style.top = "300px";
			this.bgSemi.style.left = `${fgRect.left}px`;
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
	 * スクロール位置と合体判定 (ハイライト等のヒント演出は一切行わない)
	 */
	private checkAlignmentAndBuildPath(): void {
		if (!this.fgSemi || !this.bgSemi) return;

		this.updateSemiCirclePositions();

		const fgRect = this.fgSemi.getBoundingClientRect();
		const bgRect = this.bgSemi.getBoundingClientRect();

		// 手前の半円の下端と奥の半円の上端がぴったり接するか判定 (許容誤差 ±6px)
		const dx = Math.abs(fgRect.left - bgRect.left);
		const dy = Math.abs(fgRect.bottom - bgRect.top);

		const tolerance = 6;
		this.isAligned = dx <= tolerance && dy <= tolerance;

		// ノーヒント・ハイライト演出なし
		this.buildPuzzlePath(fgRect, bgRect);
	}

	/**
	 * パズルのルート（ページのカードや見出しの縁に沿った環境溝・トラック）を構築
	 * @param fgRect - 手前要素の矩形情報
	 * @param bgRect - 奥要素の矩形情報
	 */
	private buildPuzzlePath(fgRect: DOMRect, bgRect: DOMRect): void {
		if (this.isDragging) return; // ドラッグ中はノード再構築しない

		// スタート地点: 合体した円の中心
		const startX = fgRect.left + fgRect.width / 2;
		const startY = (fgRect.bottom + bgRect.top) / 2;

		const nodes: Point[] = [{ x: startX, y: startY }];

		// ページコンテンツ（カード、見出し、ナビ等）の境界線に沿うようにトラックの節目を配置
		const contentElements = Array.from(document.querySelectorAll("main article, main section, main .card, main h1, nav"));

		if (contentElements.length >= 2) {
			const el1 = contentElements[0] as HTMLElement;
			const el2 = contentElements[Math.min(1, contentElements.length - 1)] as HTMLElement;

			const r1 = el1.getBoundingClientRect();
			const r2 = el2.getBoundingClientRect();

			// 要素の縁（境界）に沿ったチャネル座標を設定
			nodes.push({ x: Math.min(window.innerWidth - 40, r1.right), y: startY });
			nodes.push({ x: Math.min(window.innerWidth - 40, r1.right), y: r1.bottom });
			nodes.push({ x: Math.max(40, r2.left), y: r1.bottom });
			nodes.push({ x: Math.max(40, r2.left), y: r2.bottom });
		} else {
			nodes.push({ x: startX + 160, y: startY });
			nodes.push({ x: startX + 160, y: startY + 200 });
			nodes.push({ x: startX - 80, y: startY + 200 });
		}

		// ゴール地点（要素の角）
		const lastNode = nodes[nodes.length - 1];
		const goalPoint = { x: lastNode.x, y: lastNode.y + 120 };
		nodes.push(goalPoint);

		this.targetPathNodes = nodes;

		// ゴールノードUI要素の位置更新（ドラッグ中のみ表示）
		if (this.goalNodeEl) {
			this.goalNodeEl.style.left = `${goalPoint.x}px`;
			this.goalNodeEl.style.top = `${goalPoint.y}px`;
			if (this.isDragging) {
				this.goalNodeEl.classList.add("active");
			} else {
				this.goalNodeEl.classList.remove("active", "flashing");
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

		// 合体した円の中心付近（半径25px以内）をクリック/タップした場合のみパズルドラッグ開始
		if (dist <= 25) {
			this.isDragging = true;
			this.currentPathPoints = [startNode];
			this.currentProgressIndex = 0;
			this.currentDragPos = { x: e.clientX, y: e.clientY };

			if (this.canvas) {
				this.canvas.classList.add("interactive");
			}
			if (this.goalNodeEl) {
				this.goalNodeEl.classList.add("active");
			}

			e.preventDefault();
		}
	}

	/**
	 * ドラッグ移動ハンドラ
	 * @param e - ポインタイベント
	 */
	private handlePointerMove(e: PointerEvent): void {
		if (!this.isDragging || this.isCompleted || this.targetPathNodes.length < 2) return;

		e.preventDefault();
		const mouse = { x: e.clientX, y: e.clientY };
		this.currentDragPos = mouse;

		// ゴール到達直前（最後のノード）でも線描画が途切れずに更新され続けるようにインデックス範囲を制御
		const segmentIdx = Math.min(this.currentProgressIndex, this.targetPathNodes.length - 2);
		const prevTarget = this.targetPathNodes[segmentIdx];
		const nextTarget = this.targetPathNodes[segmentIdx + 1];

		// 線分 prevTarget -> nextTarget への投影位置を計算
		const projected = this.getProjectedPoint(mouse, prevTarget, nextTarget);
		const distToLine = Math.hypot(mouse.x - projected.x, mouse.y - projected.y);

		// 環境トラックの幅（許容範囲45px）
		if (distToLine < 45) {
			this.currentPathPoints = [...this.targetPathNodes.slice(0, segmentIdx + 1), projected];

			// 次のノードに到達したか
			const distToNext = Math.hypot(projected.x - nextTarget.x, projected.y - nextTarget.y);
			if (distToNext < 22 && this.currentProgressIndex < this.targetPathNodes.length - 1) {
				this.currentProgressIndex++;
				if (this.currentProgressIndex >= this.targetPathNodes.length - 1) {
					// ゴール到達可能時にゴールノードを点滅させる
					if (this.goalNodeEl) {
						this.goalNodeEl.classList.add("flashing");
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
			if (distToGoal <= 40) {
				this.triggerGoalCompletion();
				return;
			}
		}

		// ゴール未達成の場合はリセット
		this.currentPathPoints = [];
		this.currentProgressIndex = 0;
		if (this.goalNodeEl) {
			this.goalNodeEl.classList.remove("active", "flashing");
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
	 * ゴール達成演出（光の粒子が魔法の蛇のようにロゴへ吸い込まれる）
	 */
	private triggerGoalCompletion(): void {
		this.isCompleted = true;
		if (this.goalNodeEl) {
			this.goalNodeEl.classList.remove("active", "flashing");
		}

		// 描いたパズルライン沿いに「魔法の蛇」パーティクル群を生成
		const totalParticles = 70;
		this.snakeParticles = [];

		for (let i = 0; i < totalParticles; i++) {
			const pathRatio = i / totalParticles;
			const samplePos = this.getPointAlongPath(pathRatio);

			this.snakeParticles.push({
				x: samplePos.x,
				y: samplePos.y,
				vx: 0,
				vy: 0,
				size: Math.random() * 4 + 2.5,
				color: `hsl(${45 + Math.random() * 25}, 100%, ${70 + Math.random() * 25}%)`,
				alpha: 1,
				life: 0,
				maxLife: 200,
				phase: i * 0.25,
				speed: 2.5 + Math.random() * 2,
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

		// 1. 環境パズルの溝（幅広トラック）と両側の縁の輝く平行線アニメーション描画
		if (this.currentPathPoints.length >= 2) {
			this.renderEnvironmentalTrack();
		}

		// 2. ゴール後の「魔法の蛇」ロゴ追従アニメーション描画
		if (this.isCompleted && this.snakeParticles.length > 0) {
			this.renderSnakeParticles();
		}

		this.animFrameId = requestAnimationFrame(() => this.loop());
	}

	/**
	 * 『The Witness』スタイルの幅広環境チャネル（溝）と、その両側の「縁（ボーダー）」を描画
	 */
	private renderEnvironmentalTrack(): void {
		if (!this.ctx) return;

		this.ctx.save();

		const points = this.currentPathPoints;
		const trackWidth = 28; // チャネルの半幅は 14px
		const halfWidth = trackWidth / 2;

		// 1. チャネル（パズルの溝）の透明な背景帯
		this.ctx.beginPath();
		this.ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i++) {
			this.ctx.lineTo(points[i].x, points[i].y);
		}
		this.ctx.strokeStyle = "rgba(255, 220, 140, 0.2)";
		this.ctx.lineWidth = trackWidth;
		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
		this.ctx.stroke();

		// 2. トラックの両側の「外側縁（ボーダーライン）」の法線オフセット座標計算
		const leftEdges: Point[] = [];
		const rightEdges: Point[] = [];

		for (let i = 0; i < points.length; i++) {
			// 接線ベクトルの算出
			let dx = 0;
			let dy = 0;

			if (i === 0) {
				dx = points[1].x - points[0].x;
				dy = points[1].y - points[0].y;
			} else if (i === points.length - 1) {
				dx = points[i].x - points[i - 1].x;
				dy = points[i].y - points[i - 1].y;
			} else {
				dx = points[i + 1].x - points[i - 1].x;
				dy = points[i + 1].y - points[i - 1].y;
			}

			const len = Math.hypot(dx, dy) || 1;
			// 単位法線ベクトル
			const nx = -dy / len;
			const ny = dx / len;

			leftEdges.push({ x: points[i].x + nx * halfWidth, y: points[i].y + ny * halfWidth });
			rightEdges.push({ x: points[i].x - nx * halfWidth, y: points[i].y - ny * halfWidth });
		}

		// 左側の縁（ボーダーライン）を描画
		this.drawGlowingEdgeLine(leftEdges);
		// 右側の縁（ボーダーライン）を描画
		this.drawGlowingEdgeLine(rightEdges);

		// 3. トラックの左右の「縁」に沿ってキラキラ粒子をランダム発生させる
		if (Math.random() < 0.7) {
			const edgeList = Math.random() < 0.5 ? leftEdges : rightEdges;
			const idx = Math.floor(Math.random() * edgeList.length);
			const pt = edgeList[idx];

			this.particles.push({
				x: pt.x + (Math.random() - 0.5) * 4,
				y: pt.y + (Math.random() - 0.5) * 4,
				vx: (Math.random() - 0.5) * 0.6,
				vy: (Math.random() - 0.5) * 0.6,
				size: Math.random() * 2.5 + 1,
				color: "#fff7c2",
				alpha: 1,
				life: 0,
				maxLife: 25,
				phase: 0,
				speed: 0,
			});
		}

		// 縁のキラキラ粒子の描画・更新
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
	 * チャネルの「縁（ボーダー）」に輝くラインを描画
	 * @param edgePoints - 縁の座標リスト
	 */
	private drawGlowingEdgeLine(edgePoints: Point[]): void {
		if (!this.ctx || edgePoints.length < 2) return;

		this.ctx.beginPath();
		this.ctx.moveTo(edgePoints[0].x, edgePoints[0].y);
		for (let i = 1; i < edgePoints.length; i++) {
			this.ctx.lineTo(edgePoints[i].x, edgePoints[i].y);
		}
		this.ctx.strokeStyle = "rgba(255, 240, 180, 0.85)";
		this.ctx.lineWidth = 2.5;
		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
		this.ctx.shadowColor = "rgba(255, 200, 80, 0.9)";
		this.ctx.shadowBlur = 8;
		this.ctx.stroke();
	}

	/**
	 * RPGの仲間のように揺らぎながらロゴへ向かって追従・吸い込まれる魔法の蛇アニメーション
	 */
	private renderSnakeParticles(): void {
		if (!this.ctx) return;

		const logoEl = document.querySelector("#logo, #floating-logo, header a, header");
		const logoRect = logoEl ? logoEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: 20, width: 100, height: 40 };
		const logoTarget: Point = {
			x: logoRect.left + logoRect.width / 2,
			y: logoRect.top + logoRect.height / 2,
		};

		this.ctx.save();

		this.snakeParticles = this.snakeParticles.filter((p) => {
			p.life++;

			const dx = logoTarget.x - p.x;
			const dy = logoTarget.y - p.y;
			const dist = Math.hypot(dx, dy);

			if (dist > 12) {
				const angle = Math.atan2(dy, dx);

				// RPGの仲間のうねり（サイン波の揺らぎ）
				p.phase += 0.09;
				const waveOffset = Math.sin(p.phase) * 7;
				const perpAngle = angle + Math.PI / 2;

				p.x += Math.cos(angle) * p.speed + Math.cos(perpAngle) * waveOffset;
				p.y += Math.sin(angle) * p.speed + Math.sin(perpAngle) * waveOffset;
			} else {
				// ロゴに吸い込まれた際消滅
				p.alpha -= 0.08;
			}

			this.ctx!.fillStyle = p.color;
			this.ctx!.shadowColor = p.color;
			this.ctx!.shadowBlur = 8;
			this.ctx!.globalAlpha = Math.max(0, p.alpha);

			this.ctx!.beginPath();
			this.ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			this.ctx!.fill();

			return p.alpha > 0 && p.life < p.maxLife;
		});

		this.ctx.restore();
	}

	/**
	 * エフェクトを停止しクリーンアップ
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
