import Matter from "matter-js";
import { themeChangeLock, updateAllToggleButtonsUI, updateTheme } from "../theme-utils";
import { addStyle, removeStyle } from "../ui-utils";
import moonJumperStyles from "./moon-jumper.css?inline";

const { Engine, Runner, Bodies, Composite, Body, Events } = Matter;

interface Platform {
	body: Matter.Body;
}

/**
 * 「Moon Jumper」を制御するクラス
 */
class MoonJumper {
	/** 物理エンジン */
	private engine: Matter.Engine | null = null;
	/** 実行ランナー */
	private runner: Matter.Runner | null = null;
	/** ゲーム用コンテナ */
	private container: HTMLDivElement | null = null;
	/** プレイヤー（ウサギ）の物理ボディ */
	private rabbit: Matter.Body | null = null;
	/** プレイヤー（ウサギ）の表示要素 */
	private rabbitEl: HTMLDivElement | null = null;
	/** 高度表示要素 */
	private heightEl: HTMLDivElement | null = null;
	/** 左側の壁 */
	private leftWall: Matter.Body | null = null;
	/** 右側の壁 */
	private rightWall: Matter.Body | null = null;
	/** 静的プラットフォームのリスト */
	private platforms: Platform[] = [];
	/** 足場（雲）のリスト */
	private clouds: { body: Matter.Body; el: HTMLDivElement }[] = [];
	/** 背景の星々のリスト */
	private stars: { el: HTMLDivElement; x: number; y: number; parallax: number; opacity: number }[] = [];
	/** 宇宙空間に到達したかどうか */
	private inSpace = false;
	/** 最後にクリックした時間 */
	private lastClickTime = 0;
	/** アニメーションフレームID */
	private animationFrameId: number | null = null;
	/** クリックハンドラ */
	private clickHandler: ((e: MouseEvent) => void) | null = null;
	/** リサイズハンドラ */
	private resizeHandler: (() => void) | null = null;
	/** スクロールロックハンドラ */
	private scrollLockHandler: ((e: Event) => void) | null = null;

	/**
	 * ゲームを開始する
	 */
	public async start() {
		if (this.container) return;

		// 1. 最下部までスクロール
		window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
		// スクロール完了を待機
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// 2. スクロールをロック
		this.lockScroll();

		addStyle(moonJumperStyles, "moon-jumper-style");

		this.container = document.createElement("div");
		this.container.id = "moon-jumper-container";
		document.body.appendChild(this.container);

		this.initPhysics();
		this.spawnRabbit();
		this.initPlatforms();
		this.startLoop();

		this.clickHandler = (e: MouseEvent) => this.handleClick(e);
		window.addEventListener("mousedown", this.clickHandler, { capture: true, passive: false });

		this.resizeHandler = () => this.handleResize();
		window.addEventListener("resize", this.resizeHandler);
	}

	/**
	 * スクロールをロックする
	 */
	private lockScroll() {
		document.body.style.overflow = "hidden";
		this.scrollLockHandler = (e: Event) => {
			if (this.container) {
				e.preventDefault();
			}
		};
		window.addEventListener("wheel", this.scrollLockHandler, { passive: false });
		window.addEventListener("touchmove", this.scrollLockHandler, { passive: false });
	}

	/**
	 * スクロールロックを解除する
	 */
	private unlockScroll() {
		document.body.style.overflow = "";
		if (this.scrollLockHandler) {
			window.removeEventListener("wheel", this.scrollLockHandler);
			window.removeEventListener("touchmove", this.scrollLockHandler);
		}
	}

	/**
	 * 物理演算を初期化する
	 */
	private initPhysics() {
		this.engine = Engine.create();
		this.engine.gravity.y = 1.2;

		this.runner = Runner.create();
		Runner.run(this.runner, this.engine);

		const width = window.innerWidth;
		const docHeight = document.body.scrollHeight;

		const ground = Bodies.rectangle(width / 2, docHeight + 50, width * 5, 100, {
			isStatic: true,
			label: "ground",
			friction: 0.5,
		});

		// スペースモードでは、ループ内で壁を移動させてビューポートに追従させる
		this.leftWall = Bodies.rectangle(-50, docHeight / 2, 100, docHeight * 10, { isStatic: true });
		this.rightWall = Bodies.rectangle(width + 50, docHeight / 2, 100, docHeight * 10, { isStatic: true });

		Composite.add(this.engine.world, [ground, this.leftWall, this.rightWall]);

		Events.on(this.engine, "collisionStart", (event) => {
			event.pairs.forEach((pair) => {
				const labels = [pair.bodyA.label, pair.bodyB.label];
				if (labels.includes("rabbit") && (labels.includes("cloud") || labels.includes("platform") || labels.includes("ground"))) {
					const rabbitBody = pair.bodyA.label === "rabbit" ? pair.bodyA : pair.bodyB;
					if (rabbitBody.velocity.y > 0) {
						// ジャンプ時にランダムな水平方向の微調整を加える
						const jumpForce = -18;
						const nudge = (Math.random() - 0.5) * 6;
						Body.setVelocity(rabbitBody, { x: rabbitBody.velocity.x + nudge, y: jumpForce });
					}
				}
			});
		});
	}

	/**
	 * プレイヤー（ウサギ）を生成する
	 */
	private spawnRabbit() {
		const width = window.innerWidth;
		const docHeight = document.body.scrollHeight;

		this.rabbit = Bodies.circle(width / 2, docHeight - 100, 20, {
			restitution: 0.2,
			friction: 0.1,
			label: "rabbit",
		});
		Composite.add(this.engine!.world, this.rabbit);

		this.rabbitEl = document.createElement("div");
		this.rabbitEl.id = "rabbit-element";
		this.rabbitEl.textContent = "🐇";

		this.heightEl = document.createElement("div");
		this.heightEl.className = "moon-jumper-height";
		this.rabbitEl.appendChild(this.heightEl);

		this.container?.appendChild(this.rabbitEl);
	}

	/**
	 * DOM要素からプラットフォームを生成する
	 */
	private initPlatforms() {
		// モバイルチェック: ウィンドウ幅が狭い場合、DOMベースのプラットフォームを生成しない
		if (window.innerWidth < 768) return;

		const elements = Array.from(document.querySelectorAll(`a, button, h1, h2, h3, .card, p, li, img, span, div[id^="work-card-"]`));
		const currentScroll = window.scrollY;
		const processedRects: { left: number; right: number; top: number; bottom: number }[] = [];

		elements.forEach((el) => {
			const style = window.getComputedStyle(el);
			if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return;

			// el またはその祖先が fixed/sticky かどうかをチェック
			let parent: Element | null = el;
			let isFixed = false;
			while (parent && parent !== document.body) {
				const pStyle = window.getComputedStyle(parent);
				if (pStyle.position === "fixed" || pStyle.position === "sticky") {
					isFixed = true;
					break;
				}
				parent = parent.parentElement;
			}
			if (isFixed) return;

			const isImage = el.tagName === "IMG";

			// テキストを含む要素については、ブロック要素全体の幅ではなく、
			// 実際のテキスト行のヒットボックスを取得するために Range を使用する。
			const textNodes: Text[] = [];
			const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
			let node;
			while ((node = walker.nextNode())) {
				if (node.textContent?.trim()) {
					textNodes.push(node as Text);
				}
			}

			if (textNodes.length > 0) {
				const range = document.createRange();
				textNodes.forEach((textNode) => {
					range.selectNodeContents(textNode);
					const rects = Array.from(range.getClientRects());
					rects.forEach((rect) => this.addPlatformFromRect(rect, currentScroll, processedRects));
				});
			} else if (isImage || el.id.startsWith("work-card-")) {
				const rect = el.getBoundingClientRect();
				this.addPlatformFromRect(rect, currentScroll, processedRects);
			}
		});
	}

	/**
	 * 矩形情報からプラットフォームを追加する
	 * @param rect - 対象の矩形
	 * @param currentScroll - 現在のスクロール位置
	 * @param processedRects - すでに処理済みの矩形リスト
	 */
	private addPlatformFromRect(rect: DOMRect | DOMRectReadOnly, currentScroll: number, processedRects: { left: number; right: number; top: number; bottom: number }[]) {
		if (rect.width < 10 || rect.height < 10) return;

		// すでに処理されたプラットフォームとの重複を避ける
		const isOverlapping = processedRects.some((r) => rect.left >= r.left - 1 && rect.right <= r.right + 1 && rect.top >= r.top - 1 && rect.bottom <= r.bottom + 1);
		if (isOverlapping) return;

		const absY = rect.top + currentScroll;
		const absX = rect.left + rect.width / 2;
		const body = Bodies.rectangle(absX, absY + rect.height / 2, rect.width, rect.height, {
			isStatic: true,
			label: "platform",
			friction: 0.5,
		});

		if (this.engine) {
			Composite.add(this.engine.world, body);
			this.platforms.push({ body });
			processedRects.push({
				left: rect.left,
				right: rect.right,
				top: rect.top,
				bottom: rect.bottom,
			});
		}
	}

	/**
	 * クリック時のイベントハンドラ（雲を生成）
	 * @param e - マウスイベント
	 */
	private handleClick(e: MouseEvent) {
		if (!this.engine || !this.rabbit) return;

		// スペースモードでない（地上にいる）場合のみ、リンク/ボタンをチェックする
		if (!this.inSpace && (e.target as HTMLElement).closest("a, button")) return;

		const now = Date.now();
		// アンチスパム: 300ms のクールダウン
		if (now - this.lastClickTime < 300) return;
		this.lastClickTime = now;

		if (this.clouds.length >= 30) {
			const oldest = this.clouds.shift();
			if (oldest) {
				Composite.remove(this.engine.world, oldest.body);
				oldest.el.remove();
			}
		}

		// ビューポートのクリックをドキュメント座標に変換
		const x = e.clientX;
		let y = e.clientY + window.scrollY;

		// スペースモード（ドキュメントの最上部を超えて上昇中）の場合、高度に合わせて y を調整
		const viewportH = window.innerHeight;
		if (this.inSpace) {
			const altitude = viewportH * 0.1 - this.rabbit.position.y;
			y -= altitude;

			// スペースモードでは背後のページとのインタラクションを停止
			e.preventDefault();
			e.stopPropagation();
		}

		const distToRabbit = Math.hypot(x - this.rabbit.position.x, y - this.rabbit.position.y);
		if (distToRabbit < 30) return;

		const cloudBody = Bodies.rectangle(x, y, 80, 20, { isStatic: true, label: "cloud" });
		Composite.add(this.engine.world, cloudBody);

		const cloudEl = document.createElement("div");
		cloudEl.textContent = "☁️";
		cloudEl.className = "moon-jumper-cloud";
		this.container?.appendChild(cloudEl);

		const cloud = { body: cloudBody, el: cloudEl };
		this.clouds.push(cloud);

		// ランダム性を持たせたわずかな水平方向の微調整
		const dx = (x - this.rabbit.position.x) * 0.0001 + (Math.random() - 0.5) * 0.005;
		Body.applyForce(this.rabbit, this.rabbit.position, { x: dx, y: 0 });

		setTimeout(() => {
			if (this.engine) {
				Composite.remove(this.engine.world, cloud.body);
				this.clouds = this.clouds.filter((c) => c !== cloud);
			}
			cloud.el.style.opacity = "0";
			setTimeout(() => cloud.el.remove(), 2000);
		}, 8000);
	}

	/**
	 * ウィンドウリサイズ時のイベントハンドラ
	 */
	private handleResize() {
		const width = window.innerWidth;
		if (this.leftWall && this.rightWall) {
			Body.setPosition(this.leftWall, { x: -50, y: this.leftWall.position.y });
			Body.setPosition(this.rightWall, { x: width + 50, y: this.rightWall.position.y });
		}
	}

	/**
	 * ゲームループを開始する
	 */
	private startLoop() {
		const update = () => {
			if (!this.rabbit || !this.rabbitEl || !this.container || !this.heightEl) return;

			const pos = this.rabbit.position;
			const viewportH = window.innerHeight;

			let targetScrollY = pos.y - viewportH * 0.5;
			if (targetScrollY < 0) {
				targetScrollY = 0;
			}
			window.scrollTo(0, targetScrollY);

			const currentScrollY = window.scrollY;

			let renderY = pos.y - currentScrollY;

			// ビューポートの制約を適用
			const minRenderY = viewportH * 0.1;
			const maxRenderY = viewportH * 0.9;

			if (renderY < minRenderY) {
				renderY = minRenderY;
			} else if (renderY > maxRenderY && pos.y < document.body.scrollHeight - 100) {
				renderY = maxRenderY;
			}

			// スペースモード: ウサギがスクロール可能なエリアより上に行こうとしたとき
			if (pos.y < viewportH * 0.1) {
				const altitude = viewportH * 0.1 - pos.y;
				const bgOpacity = Math.min(0.9, altitude / 4000);
				this.container.style.backgroundColor = `rgba(0, 0, 20, ${bgOpacity})`;

				const main = document.querySelector("main") as HTMLElement;
				if (main) {
					main.style.opacity = `${Math.max(0, 1 - altitude / 1500)}`;
				}

				if (!this.inSpace) {
					this.inSpace = true;
					themeChangeLock(true, "dark");
					if (this.container) this.container.style.pointerEvents = "auto";
				}
				this.updateStars(altitude);
			} else {
				this.container.style.backgroundColor = "transparent";
				const main = document.querySelector("main") as HTMLElement;
				if (main) {
					main.style.opacity = "1";
				}

				if (this.inSpace) {
					this.inSpace = false;
					themeChangeLock(false);
					updateTheme();
					updateAllToggleButtonsUI();
					if (this.container) this.container.style.pointerEvents = "none";
				}
				this.hideStars();
			}

			// レンダリング
			this.rabbitEl.style.left = `${pos.x}px`;
			this.rabbitEl.style.top = `${renderY}px`;
			this.rabbitEl.style.transform = `translate(-50%, -50%) rotate(${this.rabbit.angle}rad)`;

			const displayAltitude = Math.max(0, Math.floor((document.body.scrollHeight - pos.y) / 10));
			if (displayAltitude > 1000) {
				this.heightEl.textContent = `${(displayAltitude / 1000).toFixed(1)}km`;
			} else {
				this.heightEl.textContent = `${displayAltitude}m`;
			}

			this.clouds.forEach((c) => {
				const cRenderY = c.body.position.y - currentScrollY;
				// スペースモードでは、ウサギを固定している場合に雲のレンダリング Y 座標を調整する必要がある場合がある
				let finalCRenderY = cRenderY;
				if (pos.y < viewportH * 0.1) {
					finalCRenderY = cRenderY + (viewportH * 0.1 - pos.y);
				}
				c.el.style.left = `${c.body.position.x}px`;
				c.el.style.top = `${finalCRenderY}px`;
			});

			// スペースモードでウサギに追従するように壁を更新
			if (this.leftWall && this.rightWall) {
				Body.setPosition(this.leftWall, { x: -50, y: pos.y });
				Body.setPosition(this.rightWall, { x: window.innerWidth + 50, y: pos.y });
			}

			// ウサギを画面幅内に制限
			if (pos.x < 20) Body.setPosition(this.rabbit, { x: 20, y: pos.y });
			if (pos.x > window.innerWidth - 20) Body.setPosition(this.rabbit, { x: window.innerWidth - 20, y: pos.y });

			// 不具合などで落下した場合のリスポーン
			if (pos.y > document.body.scrollHeight + 500) {
				Body.setPosition(this.rabbit, { x: window.innerWidth / 2, y: document.body.scrollHeight - 100 });
				Body.setVelocity(this.rabbit, { x: 0, y: 0 });
			}

			this.animationFrameId = requestAnimationFrame(update);
		};
		update();
	}

	/**
	 * 背景の星々を高度に合わせて更新する
	 * @param altitude - 現在の高度
	 */
	private updateStars(altitude: number) {
		if (this.stars.length === 0) {
			for (let i = 0; i < 60; i++) {
				const el = document.createElement("div");
				const opacity = Math.random();
				el.className = "moon-jumper-star";
				const size = Math.random() > 0.8 ? "3px" : "1.5px";
				el.style.width = size;
				el.style.height = size;
				if (Math.random() > 0.9) {
					el.style.boxShadow = "0 0 5px #fff";
				}
				this.container?.appendChild(el);
				this.stars.push({
					el,
					x: Math.random() * 100,
					y: Math.random() * 100,
					parallax: Math.random() * 0.4 + 0.1,
					opacity,
				});
			}
		}

		const vh = window.innerHeight;
		this.stars.forEach((s) => {
			const yPos = ((s.y * vh) / 100 + altitude * s.parallax) % vh;
			s.el.style.left = `${s.x}%`;
			s.el.style.top = `${yPos}px`;
			s.el.style.opacity = `${Math.min(1, altitude / 1000) * s.opacity}`;
		});
	}

	/**
	 * 星々を非表示にする
	 */
	private hideStars() {
		this.stars.forEach((s) => (s.el.style.opacity = "0"));
	}

	/**
	 * ゲームを停止し、全リソースを解放する
	 */
	public stop() {
		this.unlockScroll();
		if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
		if (this.runner) Runner.stop(this.runner);
		if (this.clickHandler) window.removeEventListener("mousedown", this.clickHandler, { capture: true });
		if (this.resizeHandler) window.removeEventListener("resize", this.resizeHandler);

		const main = document.querySelector("main") as HTMLElement;
		if (main) {
			main.style.opacity = "1";
			main.style.pointerEvents = "auto";
		}

		themeChangeLock(false);
		updateTheme(); // ストレージまたは自動設定から元のテーマを使用
		updateAllToggleButtonsUI();

		if (this.container) {
			this.container.style.opacity = "0";
			setTimeout(() => {
				this.container?.remove();
				this.container = null;
				removeStyle("moon-jumper-style");
				this.engine = null;
				this.runner = null;
				this.rabbit = null;
				this.rabbitEl = null;
				this.heightEl = null;
				this.leftWall = null;
				this.rightWall = null;
				this.platforms = [];
				this.clouds = [];
				this.stars = [];
			}, 1000);
		}
	}
}

/** MoonJumperインスタンス */
export const moonJumper = new MoonJumper();
/** ゲーム開始関数 */
export const startMoonJumper = () => {
	moonJumper.start();
};
/** ゲーム停止関数 */
export const stopMoonJumper = () => moonJumper.stop();
