type Matrix = number[][];
type Shape = number[][];

export class Tetris {
	// -------------------------
	// 定数・設定
	// -------------------------
	private static readonly W = 10;
	private static readonly H = 20;
	private static readonly BLOCK_SIZE = 24;

	private static readonly COLORS = [
		"#00f0f0", // I (Cyan)
		"#f0f000", // O (Yellow)
		"#a000f0", // T (Purple)
		"#f0a000", // L (Orange)
		"#0000f0", // J (Blue)
		"#00f000", // S (Green)
		"#f00000", // Z (Red)
	];

	// 形の定義 (Index: 0:I, 1:O, 2:T, 3:L, 4:J, 5:S, 6:Z)
	private static readonly SHAPES: Shape[] = [
		[[1, 1, 1, 1]], // I
		[
			[1, 1],
			[1, 1],
		], // O
		[
			[0, 1, 0],
			[1, 1, 1],
		], // T
		[
			[0, 0, 1],
			[1, 1, 1],
		], // L (通常回転)
		[
			[1, 0, 0],
			[1, 1, 1],
		], // J (通常回転)
		[
			[0, 1, 1],
			[1, 1, 0],
		], // S
		[
			[1, 1, 0],
			[0, 1, 1],
		], // Z
	];

	// -------------------------
	// 開幕テンプレ（DT砲もどき）用の固定シーケンス
	// ※オートモード開始時のみ使用し、技を見せる
	// -------------------------
	private static readonly OPENER_SEQUENCE = [3, 4, 1, 6, 5, 0, 0]; // L, J, O, Z, S, I, I (予備)
	private static readonly OPENER_MOVES = [
		{ x: -1, r: 3 }, // L: 左端へ縦置き
		{ x: 8, r: 1 }, // J: 右端へ縦置き
		{ x: 3, r: 0 }, // O: 中央ちょい左
		{ x: 5, r: 1 }, // Z: 中央右に立てる
		{ x: 1, r: 1 }, // S: 左に立てる（これでDTの屋根ができる）
		// 以降はAIにお任せ（Tが来れば入る）
	];

	// -------------------------
	// プロパティ
	// -------------------------
	private ctx: CanvasRenderingContext2D;
	private field: Matrix;
	private piece: Shape | null = null;
	private pieceIndex = 0; // 0~6

	private px = 3;
	private py = 0;
	private ghostY = 0;

	private score = 0;
	private gameOver = false;
	private restartTimer = 0;

	// 落下・操作関連
	private fallCounter = 0;
	private fallInterval = 30;
	private isAutoMode = true;
	private lastInputTime = Date.now();
	private readonly AUTO_MODE_DELAY = 10000;

	// AI思考用
	private aiTarget: { x: number; rotation: number } | null = null;
	private aiMoveDelay = 0;

	// オープナー制御用
	private openerIndex = 0;
	private isOpenerActive = true;

	constructor(canvas: HTMLCanvasElement) {
		canvas.width = Tetris.W * Tetris.BLOCK_SIZE;
		canvas.height = Tetris.H * Tetris.BLOCK_SIZE;
		this.ctx = canvas.getContext("2d")!;
		this.field = this.createField();
	}

	// -------------------------
	// 基本処理
	// -------------------------
	private createField(): Matrix {
		return Array.from({ length: Tetris.H }, () => Array(Tetris.W).fill(0));
	}

	private newPiece() {
		// オープナー（開幕定石）実行中の判定
		if (this.isAutoMode && this.isOpenerActive && this.openerIndex < Tetris.OPENER_SEQUENCE.length) {
			this.pieceIndex = Tetris.OPENER_SEQUENCE[this.openerIndex];
		} else {
			// 通常ランダム
			this.isOpenerActive = false; // 定石終了
			this.pieceIndex = Math.floor(Math.random() * Tetris.SHAPES.length);
		}

		this.piece = Tetris.SHAPES[this.pieceIndex].map((r) => [...r]);

		// 初期位置
		this.px = Math.floor(Tetris.W / 2) - Math.floor(this.piece[0].length / 2);
		this.py = 0;

		this.aiTarget = null; // AIターゲットリセット

		if (this.collide(this.px, this.py)) {
			this.gameOver = true;
		}
		this.updateGhost();
	}

	private collide(nx: number, ny: number, shape: Shape = this.piece!, field: Matrix = this.field): boolean {
		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape[y].length; x++) {
				if (!shape[y][x]) continue;
				const fx = nx + x;
				const fy = ny + y;
				if (fy >= Tetris.H || fx < 0 || fx >= Tetris.W) return true;
				if (fy >= 0 && field[fy][fx]) return true;
			}
		}
		return false;
	}

	private updateGhost() {
		if (!this.piece) return;
		let gy = this.py;
		while (!this.collide(this.px, gy + 1)) gy++;
		this.ghostY = gy;
	}

	private merge() {
		if (!this.piece) return;
		for (let y = 0; y < this.piece.length; y++) {
			for (let x = 0; x < this.piece[y].length; x++) {
				if (this.piece[y][x]) {
					this.field[this.py + y][this.px + x] = this.pieceIndex + 1;
				}
			}
		}

		// 定石進行
		if (this.isAutoMode && this.isOpenerActive) {
			this.openerIndex++;
		}
	}

	private clearLines() {
		let cleared = 0;
		for (let y = Tetris.H - 1; y >= 0; y--) {
			if (this.field[y].every((v) => v !== 0)) {
				this.field.splice(y, 1);
				this.field.unshift(Array(Tetris.W).fill(0));
				cleared++;
				y++;
			}
		}

		// スコア演出 (簡易)
		if (cleared > 0) {
			// Tetris(4列)なら高得点
			const bonus = cleared === 4 ? 800 : cleared * 100;
			this.score += bonus;
		}
	}

	private rotate(shape: Shape): Shape {
		const h = shape.length;
		const w = shape[0].length;
		const result: Shape = Array.from({ length: w }, () => Array(h).fill(0));
		for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) result[x][h - 1 - y] = shape[y][x];
		return result;
	}

	private tryRotate() {
		if (!this.piece) return;
		const rotated = this.rotate(this.piece);

		// 通常回転
		if (!this.collide(this.px, this.py, rotated)) {
			this.piece = rotated;
			this.updateGhost();
			return;
		}

		// 壁蹴り（簡易実装：左右に1マスずらして入るならOKとする）
		// これによりTスピンねじ込みなどが成功しやすくなる
		if (!this.collide(this.px + 1, this.py, rotated)) {
			this.px++;
			this.piece = rotated;
			this.updateGhost();
			return;
		}
		if (!this.collide(this.px - 1, this.py, rotated)) {
			this.px--;
			this.piece = rotated;
			this.updateGhost();
			return;
		}
	}

	// -------------------------
	// AI アルゴリズム
	// -------------------------
	private think() {
		if (!this.piece) return;

		// --- A. オープナー（定石）モード ---
		if (this.isOpenerActive && this.openerIndex < Tetris.OPENER_MOVES.length) {
			const move = Tetris.OPENER_MOVES[this.openerIndex];
			// 指定の回転数になるまで回す（仮のターゲット設定）
			this.aiTarget = { x: move.x, rotation: move.r };
			return;
		}

		// --- B. 通常AIモード ---
		let bestScore = -Infinity;
		let bestMove = { x: this.px, rotation: 0 };
		let currentShape = this.piece.map((r) => [...r]);

		// 現在の盤面の最大高さを取得（危険度判定用）
		const maxH = this.getMaxHeight(this.field);
		// 危険モード: 半分(10)を超えたら生存優先、低ければロマン(Tetris/T-Spin)優先
		const isDanger = maxH > 10;

		// 全4回転を試行
		for (let r = 0; r < 4; r++) {
			// 横幅スキャン
			for (let x = -2; x < Tetris.W; x++) {
				if (!this.collide(x, this.py, currentShape)) {
					// 接地地点を探す
					let dy = this.py;
					while (!this.collide(x, dy + 1, currentShape)) {
						dy++;
					}

					// 評価実行
					const score = this.evaluateGrid(x, dy, currentShape, r, isDanger);
					if (score > bestScore) {
						bestScore = score;
						bestMove = { x, rotation: r };
					}
				}
			}
			currentShape = this.rotate(currentShape);
		}
		this.aiTarget = bestMove;
	}

	// 盤面評価関数
	private evaluateGrid(tx: number, ty: number, shape: Shape, rotation: number, isDanger: boolean): number {
		// 1. 仮の盤面を作成
		const grid = this.field.map((row) => [...row]);
		let linesCleared = 0;

		// 配置
		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape[y].length; x++) {
				if (shape[y][x]) {
					if (ty + y < Tetris.H && tx + x >= 0 && tx + x < Tetris.W) {
						grid[ty + y][tx + x] = 1;
					}
				}
			}
		}

		// ライン消去数計算
		for (let y = 0; y < Tetris.H; y++) {
			if (grid[y].every((v) => v !== 0)) linesCleared++;
		}

		// 2. 指標計算
		let holes = 0; // 穴（ブロックの下にある空間）
		let bumpiness = 0; // 隣の列との高低差の総和
		let aggregateHeight = 0; // 全列の高さの総和
		let blockades = 0; // 穴の上にあるブロック数

		const colHeights = new Array(Tetris.W).fill(0);
		for (let x = 0; x < Tetris.W; x++) {
			let colHeight = 0;
			let foundBlock = false;
			for (let y = 0; y < Tetris.H; y++) {
				if (grid[y][x] !== 0) {
					if (!foundBlock) {
						colHeight = Tetris.H - y;
						foundBlock = true;
					}
				} else if (foundBlock) {
					// ブロックの下の空白＝穴
					holes++;
				}
			}
			colHeights[x] = colHeight;
			aggregateHeight += colHeight;
		}

		// 高低差 (Bumpiness)
		for (let x = 0; x < Tetris.W - 1; x++) {
			bumpiness += Math.abs(colHeights[x] - colHeights[x + 1]);
		}

		// 3. T-Spin判定 (簡易: Tミノかつ、四隅の3つ以上が埋まっているか)
		let tSpinBonus = 0;
		if (this.pieceIndex === 2) {
			// T Piece
			// T-Spinは「配置したとき」の周囲の状況を見る
			// (ここでは簡易的に、回転後の形状の中心座標などで判定するのが厳密だが、
			//  ヒューリスティックとしては「ラインを消しつつ、形がハマっている」ことを評価する)
			if (linesCleared >= 2) tSpinBonus = 50; // Tミノで複数ライン消すのは良いこととみなす
		}

		// 4. 重み付け (状態によって切り替え)
		let score = 0;

		if (isDanger) {
			// --- 生存優先モード ---
			// 穴と高さを強烈に罰する
			score -= holes * 100;
			score -= bumpiness * 5;
			score -= aggregateHeight * 2;
			score += linesCleared * 20; // とにかく消せ
		} else {
			// --- ロマン(Tetris/T-Spin)モード ---

			// A. 右端(x=9)は「Well(井戸)」として空けておきたい
			// 右端にブロックを置くのはペナルティ。ただし4ライン消える(Tetris)ならOK。
			const isCoveringWell = tx + shape[0].length > 9; // 簡易判定
			if (isCoveringWell && linesCleared < 4) {
				score -= 30; // 井戸を塞ぐな
			}
			if (linesCleared === 4) score += 1000; // Tetris!

			// B. T-Spinボーナス
			score += tSpinBonus;

			// C. 基本評価
			score -= holes * 40; // 穴はやっぱりダメ
			score -= bumpiness * 2; // 平らに積む
			score -= aggregateHeight * 1;

			// 1~3ライン消しは、コンボ中でなければあまり評価しない（溜めたいから）
			if (linesCleared > 0 && linesCleared < 4) score -= 10;
		}

		return score;
	}

	private getMaxHeight(field: Matrix): number {
		for (let y = 0; y < Tetris.H; y++) {
			if (field[y].some((v) => v !== 0)) return Tetris.H - y;
		}
		return 0;
	}

	private updateAI() {
		if (this.gameOver || !this.piece) return;

		// ターゲット未定なら思考
		if (!this.aiTarget) {
			this.think();
		}
		if (!this.aiTarget) return;

		this.aiMoveDelay++;
		if (this.aiMoveDelay < 2) return; // 速度調整
		this.aiMoveDelay = 0;

		// 1. 回転操作 (ターゲットの回転数になるまで回す)
		// ※本来は現在の回転状態を持つべきだが、簡易的に「回してみる」
		// オートモードなので一瞬で形状を合わせる処理（アニメーション的には回って見えるように順次処理）

		// 現在の形状をターゲットの回転数に合わせるための簡易ロジック
		// (this.pieceの形状から逆算するのは重いので、AI思考時に「必要な回転回数」を持っている前提で動く)
		// ここでは、aiTarget.rotationの回数分だけ rotate が呼ばれるまで回す必要があるが、
		// 内部ステートを持たないため、AI決定ターンに「必要な形状」に強制セットし、フラグで管理する方が見た目が綺麗。

		// 今回は「ターゲット回転数 > 0 なら回す」という処理をループさせる
		// 実際には handleKey と同じように rotate() を呼ぶ
		if (this.aiTarget.rotation > 0) {
			this.tryRotate();
			this.aiTarget.rotation--;
			return;
		}

		// 2. 横移動
		if (this.px < this.aiTarget.x) {
			if (!this.collide(this.px + 1, this.py)) this.px++;
		} else if (this.px > this.aiTarget.x) {
			if (!this.collide(this.px - 1, this.py)) this.px--;
		} else {
			// 3. 位置が合ったので落とす
			if (!this.collide(this.px, this.py + 1)) {
				this.py++;
			}
		}
		this.updateGhost();
	}

	// -------------------------
	// 描画・更新
	// -------------------------
	draw() {
		const ctx = this.ctx;
		ctx.clearRect(0, 0, Tetris.W * Tetris.BLOCK_SIZE, Tetris.H * Tetris.BLOCK_SIZE);

		// 背景グリッド（薄く）
		ctx.strokeStyle = "#333";
		ctx.lineWidth = 0.5;
		for (let x = 0; x <= Tetris.W; x++) {
			ctx.beginPath();
			ctx.moveTo(x * Tetris.BLOCK_SIZE, 0);
			ctx.lineTo(x * Tetris.BLOCK_SIZE, Tetris.H * Tetris.BLOCK_SIZE);
			ctx.stroke();
		}
		for (let y = 0; y <= Tetris.H; y++) {
			ctx.beginPath();
			ctx.moveTo(0, y * Tetris.BLOCK_SIZE);
			ctx.lineTo(Tetris.W * Tetris.BLOCK_SIZE, y * Tetris.BLOCK_SIZE);
			ctx.stroke();
		}

		// Field
		for (let y = 0; y < Tetris.H; y++) {
			for (let x = 0; x < Tetris.W; x++) {
				const v = this.field[y][x];
				if (v) {
					this.drawBlock(x, y, Tetris.COLORS[v - 1]);
				}
			}
		}

		// Ghost
		if (!this.gameOver && this.piece) {
			ctx.globalAlpha = 0.2;
			for (let y = 0; y < this.piece.length; y++) {
				for (let x = 0; x < this.piece[y].length; x++) {
					if (this.piece[y][x]) {
						this.drawBlock(this.px + x, this.ghostY + y, Tetris.COLORS[this.pieceIndex]);
					}
				}
			}
			ctx.globalAlpha = 1.0;
		}

		// Active
		if (!this.gameOver && this.piece) {
			for (let y = 0; y < this.piece.length; y++) {
				for (let x = 0; x < this.piece[y].length; x++) {
					if (this.piece[y][x]) {
						this.drawBlock(this.px + x, this.py + y, Tetris.COLORS[this.pieceIndex]);
					}
				}
			}
		}

		// UI
		if (this.gameOver) {
			ctx.fillStyle = "rgba(0,0,0,0.6)";
			ctx.fillRect(0, 0, Tetris.W * Tetris.BLOCK_SIZE, Tetris.H * Tetris.BLOCK_SIZE);
			ctx.fillStyle = "#fff";
			ctx.font = "bold 24px sans-serif";
			ctx.textAlign = "center";
			ctx.fillText("GAME OVER", (Tetris.W * Tetris.BLOCK_SIZE) / 2, 200);
		} else if (this.isAutoMode) {
			ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
			ctx.font = "12px sans-serif";
			ctx.textAlign = "right";
			ctx.fillText("AUTO PILOT", Tetris.W * Tetris.BLOCK_SIZE - 5, 20);

			if (this.isOpenerActive) {
				ctx.fillStyle = "#ffcc00";
				ctx.fillText("OPENER DEMO", Tetris.W * Tetris.BLOCK_SIZE - 5, 35);
			}
		}
	}

	private drawBlock(x: number, y: number, color: string) {
		const s = Tetris.BLOCK_SIZE;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x * s, y * s, s - 1, s - 1);
		// 立体感
		this.ctx.fillStyle = "rgba(0,0,0,0.1)";
		this.ctx.fillRect(x * s + s * 0.7, y * s + s * 0.7, s * 0.3, s * 0.3);
		this.ctx.fillStyle = "rgba(255,255,255,0.2)";
		this.ctx.fillRect(x * s, y * s, s * 0.2, s * 0.2);
	}

	update() {
		// オートモード遷移判定
		if (!this.isAutoMode && Date.now() - this.lastInputTime > this.AUTO_MODE_DELAY) {
			this.isAutoMode = true;
		}

		if (this.gameOver) {
			this.restartTimer++;
			if (this.restartTimer > (this.isAutoMode ? 60 : 180)) this.restart();
			return;
		}

		if (!this.piece) this.newPiece();

		// AI動作
		if (this.isAutoMode) {
			this.updateAI();
		}

		// 自然落下
		this.fallCounter++;
		if (this.fallCounter >= this.fallInterval) {
			this.fallCounter = 0;
			if (!this.collide(this.px, this.py + 1)) {
				this.py++;
			} else {
				this.merge();
				this.clearLines();
				this.newPiece();
			}
			this.updateGhost();
		}
	}

	private restart() {
		this.field = this.createField();
		this.score = 0;
		this.gameOver = false;
		this.restartTimer = 0;
		this.piece = null;
		this.isOpenerActive = true; // 次回も定石から開始
		this.openerIndex = 0;
		this.aiTarget = null;
	}

	// -------------------------
	// ユーザー入力
	// -------------------------
	handleKey(e: KeyboardEvent) {
		this.isAutoMode = false;
		this.isOpenerActive = false; // ユーザーが触ったら定石中止
		this.lastInputTime = Date.now();

		if (this.gameOver || !this.piece) return;

		const k = e.key.toLowerCase();
		if (["arrowleft", "a", "j"].includes(k)) {
			if (!this.collide(this.px - 1, this.py)) this.px--;
		}
		if (["arrowright", "d", "l"].includes(k)) {
			if (!this.collide(this.px + 1, this.py)) this.px++;
		}
		if (["arrowdown", "s", "k"].includes(k)) {
			if (!this.collide(this.px, this.py + 1)) this.py++;
		}
		if (["arrowup", "w", "i"].includes(k)) {
			this.tryRotate();
		}
		this.updateGhost();
	}
}
