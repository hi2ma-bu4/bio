import { addStyle, removeStyle } from "../ui-utils";
import starWeaverStyles from "./star-weaver.css?inline";

interface ConstellationTemplate {
	name: string;
	stars: { x: number; y: number }[]; // 0 から 1 の範囲
}

const CONSTELLATIONS: ConstellationTemplate[] = [
	{
		name: "Cassiopeia",
		stars: [
			{ x: 0.3, y: 0.2 },
			{ x: 0.4, y: 0.4 },
			{ x: 0.5, y: 0.3 },
			{ x: 0.6, y: 0.5 },
			{ x: 0.7, y: 0.3 },
		],
	},
	{
		name: "Big Dipper",
		stars: [
			{ x: 0.2, y: 0.5 },
			{ x: 0.3, y: 0.45 },
			{ x: 0.4, y: 0.48 },
			{ x: 0.5, y: 0.55 },
			{ x: 0.5, y: 0.7 },
			{ x: 0.7, y: 0.75 },
			{ x: 0.75, y: 0.6 },
		],
	},
	{
		name: "Summer Triangle",
		stars: [
			{ x: 0.5, y: 0.2 },
			{ x: 0.3, y: 0.6 },
			{ x: 0.7, y: 0.7 },
		],
	},
	{
		name: "Lyra",
		stars: [
			{ x: 0.45, y: 0.25 },
			{ x: 0.55, y: 0.25 },
			{ x: 0.5, y: 0.35 },
			{ x: 0.45, y: 0.45 },
			{ x: 0.55, y: 0.45 },
		],
	},
	{
		name: "Cygnus",
		stars: [
			{ x: 0.5, y: 0.3 },
			{ x: 0.5, y: 0.5 },
			{ x: 0.5, y: 0.8 },
			{ x: 0.3, y: 0.5 },
			{ x: 0.7, y: 0.5 },
		],
	},
];

/**
 * 「Star Weaver」を制御するクラス
 */
class StarWeaver {
	/** コンテナ要素 */
	private container: HTMLDivElement | null = null;
	/** キャンバス要素 */
	private canvas: HTMLCanvasElement | null = null;
	/** 描画コンテキスト */
	private ctx: CanvasRenderingContext2D | null = null;
	/** 配置された星々のリスト */
	private stars: { x: number; y: number; opacity: number; size: number; templateIdx?: number }[] = [];
	/** 現在作成中の星座テンプレート */
	private currentTemplate: ConstellationTemplate | null = null;
	/** 完了した星座名の表示リスト */
	private completedNames: { name: string; x: number; y: number; life: number }[] = [];
	/** アニメーションフレームID */
	private animationFrameId: number | null = null;
	/** クリックハンドラ */
	private clickHandler: ((e: MouseEvent) => void) | null = null;

	/**
	 * ゲームを開始する
	 */
	public start() {
		if (this.container) return;

		addStyle(starWeaverStyles, "star-weaver-style");

		this.container = document.createElement("div");
		this.container.id = "star-weaver-container";
		this.container.className = "star-weaver-container";

		this.canvas = document.createElement("canvas");
		this.canvas.className = "star-weaver-canvas";
		this.container.appendChild(this.canvas);
		document.body.appendChild(this.container);

		this.resize();
		this.ctx = this.canvas.getContext("2d");

		this.clickHandler = (e: MouseEvent) => this.addStar(e.clientX, e.clientY);
		this.canvas.addEventListener("mousedown", this.clickHandler);
		window.addEventListener("resize", () => this.resize());

		this.loop();
	}

	/**
	 * 画面サイズに合わせてリサイズする
	 */
	private resize() {
		if (this.canvas) {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		}
	}

	/**
	 * 指定した座標に星を追加する
	 * @param x - X座標
	 * @param y - Y座標
	 */
	private addStar(x: number, y: number) {
		if (!this.currentTemplate) {
			this.currentTemplate = CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)];
		}

		let finalX = x;
		let finalY = y;
		let templateIdx = -1;

		// スナップ処理のロジック
		const snapDist = 40;
		for (let i = 0; i < this.currentTemplate.stars.length; i++) {
			const tx = this.currentTemplate.stars[i].x * window.innerWidth;
			const ty = this.currentTemplate.stars[i].y * window.innerHeight;
			const d = Math.hypot(x - tx, y - ty);

			if (d < snapDist) {
				// すでに埋まっているかチェック
				if (!this.stars.some((s) => s.templateIdx === i)) {
					finalX = tx;
					finalY = ty;
					templateIdx = i;
					break;
				}
			}
		}

		this.stars.push({
			x: finalX,
			y: finalY,
			opacity: 1,
			size: templateIdx !== -1 ? 5 : Math.random() * 2 + 1,
			templateIdx: templateIdx !== -1 ? templateIdx : undefined,
		});

		if (this.stars.length > 100) this.stars.shift();

		// 完了チェック
		if (this.currentTemplate) {
			const filledCount = this.stars.filter((s) => s.templateIdx !== undefined).length;
			if (filledCount === this.currentTemplate.stars.length) {
				this.completedNames.push({
					name: this.currentTemplate.name,
					x: finalX,
					y: finalY - 40,
					life: 1,
				});
				this.currentTemplate = null; // 次回クリック時に新しいものを選択
				// テンプレート以外の星をフェードアウト
				this.stars = this.stars.filter((s) => s.templateIdx !== undefined);
			}
		}
	}

	/**
	 * 描画ループ
	 */
	private loop() {
		if (!this.ctx || !this.canvas) return;

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// 現在のテンプレートのヒントを描画
		if (this.currentTemplate) {
			this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
			this.currentTemplate.stars.forEach((s) => {
				const tx = s.x * window.innerWidth;
				const ty = s.y * window.innerHeight;
				this.ctx!.beginPath();
				this.ctx!.arc(tx, ty, 3, 0, Math.PI * 2);
				this.ctx!.fill();
			});
		}

		// つながりを描画
		this.ctx.beginPath();
		this.ctx.strokeStyle = "rgba(100, 150, 255, 0.3)";
		this.ctx.lineWidth = 1;
		for (let i = 0; i < this.stars.length; i++) {
			for (let j = i + 1; j < this.stars.length; j++) {
				const starA = this.stars[i];
				const starB = this.stars[j];
				const d = Math.hypot(starA.x - starB.x, starA.y - starB.y);

				// 両方がテンプレートの星であるか、距離が近い場合につなげる
				const bothTemplate = starA.templateIdx !== undefined && starB.templateIdx !== undefined;
				const connectDist = bothTemplate ? 300 : 150;

				if (d < connectDist) {
					this.ctx.moveTo(starA.x, starA.y);
					this.ctx.lineTo(starB.x, starB.y);
				}
			}
		}
		this.ctx.stroke();

		// 星を描画
		this.stars.forEach((star) => {
			this.ctx!.beginPath();
			const baseOpacity = star.templateIdx !== undefined ? 0.8 : 0.4;
			const twinkle = Math.abs(Math.sin(Date.now() / 500 + star.x)) * 0.4;
			this.ctx!.fillStyle = `rgba(255, 255, 255, ${baseOpacity + twinkle})`;
			this.ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2);
			this.ctx!.fill();

			if (star.templateIdx !== undefined) {
				this.ctx!.shadowBlur = 10;
				this.ctx!.shadowColor = "white";
				this.ctx!.stroke();
				this.ctx!.shadowBlur = 0;
			}
		});

		// 完了した名前を描画
		this.ctx.font = "bold 20px sans-serif";
		this.ctx.textAlign = "center";
		this.completedNames = this.completedNames.filter((n) => {
			this.ctx!.fillStyle = `rgba(255, 255, 255, ${n.life})`;
			this.ctx!.fillText(n.name, n.x, n.y);
			n.y -= 0.5;
			n.life -= 0.005;
			return n.life > 0;
		});

		this.animationFrameId = requestAnimationFrame(() => this.loop());
	}

	/**
	 * ゲームを停止し、全要素を削除する
	 */
	public stop() {
		if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
		if (this.clickHandler && this.canvas) this.canvas.removeEventListener("mousedown", this.clickHandler);
		this.container?.remove();
		this.container = null;
		this.canvas = null;
		this.ctx = null;
		this.stars = [];
		removeStyle("star-weaver-style");
	}
}

/** StarWeaverインスタンス */
export const starWeaver = new StarWeaver();
/** ゲーム開始関数 */
export const startStarWeaver = () => starWeaver.start();
/** ゲーム停止関数 */
export const stopStarWeaver = () => starWeaver.stop();
