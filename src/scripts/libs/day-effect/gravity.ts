import Matter from "matter-js";

// --- 型定義 ---
interface PhysicsBox {
	element: HTMLElement;
	body: Matter.Body;
	w: number;
	h: number;
}

// --- 定数 ---
const defaultSelectors: string[] = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "span", "a", "img", "span", "button", "input", "li", "i", "dialog"];
const DRAG_THRESHOLD: number = 5; // ピクセル

interface ElementSnapshot {
	position: string;
	left: string;
	top: string;
	margin: string;
	width: string;
	height: string;
	zIndex: string;
	boxSizing: string;
	touchAction: string;
	transform: string;
}

interface GravityElementWithCleanup extends HTMLElement {
	__gravityCleanup__?: () => void;
}

// --- ユーティリティ関数 ---

/**
 * 要素が直下にテキストノードを持っているか判定する
 * @param element - チェック対象の要素
 * @param minLength - 最小テキスト長
 * @returns 直下にテキストコンテンツがあれば true
 */
function hasDirectTextContent(element: HTMLElement, minLength: number = 3): boolean {
	const childNodes: NodeListOf<ChildNode> = element.childNodes;
	for (let i = 0; i < childNodes.length; i++) {
		const node: ChildNode = childNodes[i];
		// ノードタイプ 3 は Text Node
		if (node.nodeType === 3 && node.textContent) {
			if (node.textContent.trim().length >= minLength) {
				return true;
			}
		}
	}
	return false;
}

/**
 * クリック/ドラッグを判別し、ドラッグの場合はイベントをブロックするロジックを要素に付与
 * @param el - 対象のHTMLElement
 */
function attachSmartClick(el: HTMLElement): void {
	let startX: number = 0;
	let startY: number = 0;
	let moved = false;
	let pointerType = "mouse";
	let suppressNativeClickUntil = 0;

	const isInteractiveElement = (): boolean => {
		if (el.tabIndex >= 0) return true;
		const role = el.getAttribute("role");
		if (role === "button" || role === "link" || role === "menuitem" || role === "checkbox" || role === "radio" || role === "switch") return true;

		return ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "SUMMARY", "LABEL"].includes(el.tagName);
	};

	const shouldTreatAsTap = (x: number, y: number): boolean => {
		const dx = x - startX;
		const dy = y - startY;
		const dist = Math.sqrt(dx * dx + dy * dy);
		return dist <= DRAG_THRESHOLD;
	};

	const handlePointerDown = (e: PointerEvent) => {
		startX = e.clientX;
		startY = e.clientY;
		moved = false;
		pointerType = e.pointerType || "mouse";
	};
	const handlePointerMove = (e: PointerEvent) => {
		if (moved) return;
		moved = !shouldTreatAsTap(e.clientX, e.clientY);
	};
	const handlePointerUp = () => {
		if (pointerType === "mouse" || moved || !isInteractiveElement()) return;

		suppressNativeClickUntil = performance.now() + 450;
		window.setTimeout(() => {
			if (document.contains(el)) {
				el.click();
			}
		}, 0);
	};
	const handlePointerCancel = () => {
		moved = true;
	};
	const handleClick = (e: MouseEvent) => {
		if (performance.now() < suppressNativeClickUntil && e.detail !== 0) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}

		if (moved || !shouldTreatAsTap(e.clientX, e.clientY)) {
			// ドラッグと判定されたら機能をブロック
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
		// クリックと判定されたら機能を許可
	};

	el.addEventListener("pointerdown", handlePointerDown, { passive: true });
	el.addEventListener("pointermove", handlePointerMove, { passive: true });
	el.addEventListener("pointerup", handlePointerUp, { passive: true });
	el.addEventListener("pointercancel", handlePointerCancel, { passive: true });
	el.addEventListener("click", handleClick, true);

	(el as GravityElementWithCleanup).__gravityCleanup__ = () => {
		el.removeEventListener("pointerdown", handlePointerDown);
		el.removeEventListener("pointermove", handlePointerMove);
		el.removeEventListener("pointerup", handlePointerUp);
		el.removeEventListener("pointercancel", handlePointerCancel);
		el.removeEventListener("click", handleClick, true);
	};
}

// --- メイン関数 ---
let activeCleanup: (() => void) | null = null;

/**
 * 物理エンジンの初期化とDOM要素への適用を行う関数 (TS Module Export)
 * @param selectors - 物理化対象のCSSセレクタ（例: 'p, h1', または ['p', '.custom-box']）
 */
export function initializePhysicsEngine(selectors: string[] | string = defaultSelectors): void {
	stopPhysicsEngine();

	// Matter.jsのモジュールエイリアス
	const { Engine, Runner, World, Bodies, Mouse, MouseConstraint, Composite } = Matter;

	const engine: Matter.Engine = Engine.create();
	const world: Matter.World = engine.world;
	const width: number = window.innerWidth;
	const height: number = window.innerHeight;

	// --- ターゲット要素の収集とフィルタリング ---

	const selectorArray: string[] = Array.isArray(selectors) ? selectors : [selectors];
	const selectorString: string = selectorArray.join(", ");

	let rawElements: HTMLElement[] = [];
	try {
		document.querySelectorAll(selectorString).forEach((el) => {
			if (!(el instanceof HTMLElement)) return;
			const rect: DOMRect = el.getBoundingClientRect();
			if (rect.width > 5 && rect.height > 5 && el.style.display !== "none" && el.style.visibility !== "hidden") {
				rawElements.push(el);
			}
		});
	} catch (e) {
		console.error("Invalid CSS selector provided:", e);
		return;
	}

	// フィルタリング (親テキスト優先ロジック)
	const elements: HTMLElement[] = rawElements.filter((parent) => {
		const hasText: boolean = hasDirectTextContent(parent);
		const hasTargetChild: boolean = rawElements.some((child) => parent !== child && parent.contains(child));

		if (hasText) {
			// 1. 親が直接テキストを持っている場合: 親を物理化
			return true;
		} else if (hasTargetChild) {
			// 2. 親がテキストを持たず、ターゲットとなる子要素を持っている場合: 親は除外
			return false;
		}
		// 3. その他の要素: 物理化
		return true;
	});

	const boxes: PhysicsBox[] = [];
	const originalStyles = new Map<HTMLElement, ElementSnapshot>();

	elements.forEach((el) => {
		const rect: DOMRect = el.getBoundingClientRect();
		const w: number = rect.width;
		const h: number = rect.height;
		const x: number = rect.left + w / 2;
		const y: number = rect.top + h / 2;

		const body: Matter.Body = Bodies.rectangle(x, y, w, h, {
			restitution: 0.6,
			friction: 0.5,
			density: 0.001,
		});

		originalStyles.set(el, {
			position: el.style.position,
			left: el.style.left,
			top: el.style.top,
			margin: el.style.margin,
			width: el.style.width,
			height: el.style.height,
			zIndex: el.style.zIndex,
			boxSizing: el.style.boxSizing,
			touchAction: el.style.touchAction,
			transform: el.style.transform,
		});

		// スタイル適用
		el.style.position = "fixed";
		el.style.left = "0px";
		el.style.top = "0px";
		el.style.margin = "0";
		el.style.width = `${w}px`;
		el.style.height = `${h}px`;
		el.style.zIndex = "1000";
		el.style.boxSizing = "border-box";
		el.style.touchAction = "manipulation";
		el.setAttribute("draggable", "false");

		// スマートクリック判定を付与
		attachSmartClick(el);

		// 初期位置
		el.style.transform = `translate3d(${body.position.x - w / 2}px, ${body.position.y - h / 2}px, 0)`;

		World.add(world, body);

		boxes.push({ element: el, body: body, w, h });
	});

	// --- 壁と床 ---
	const wallThick: number = 200;
	const ground: Matter.Body = Bodies.rectangle(width / 2, height + wallThick / 2, width, wallThick, { isStatic: true });
	const leftWall: Matter.Body = Bodies.rectangle(0 - wallThick / 2, height / 2, wallThick, height * 5, { isStatic: true });
	const rightWall: Matter.Body = Bodies.rectangle(width + wallThick / 2, height / 2, wallThick, height * 5, { isStatic: true });

	World.add(world, [ground, leftWall, rightWall]);

	// --- マウス操作 ---
	const mouse: Matter.Mouse = Mouse.create(document.body);
	const mouseConstraint: Matter.MouseConstraint = MouseConstraint.create(engine, {
		mouse: mouse,
		constraint: { stiffness: 0.2, render: { visible: false } },
	});
	World.add(world, mouseConstraint);

	// スクロール無効化
	mouse.element.removeEventListener("mousewheel", (mouse as any).mousewheel);
	mouse.element.removeEventListener("DOMMouseScroll", (mouse as any).mousewheel);

	// --- ループ処理 ---
	const runner: Matter.Runner = Runner.create();
	let frameId: number | null = null;

	const renderLoop = (): void => {
		Runner.tick(runner, engine, 1000 / 60);

		boxes.forEach((box) => {
			const b: Matter.Body = box.body;
			const el: HTMLElement = box.element;
			const x: number = b.position.x - box.w / 2;
			const y: number = b.position.y - box.h / 2;

			// CSS Transformで同期
			el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${b.angle}rad)`;
		});

		frameId = requestAnimationFrame(renderLoop);
	};
	frameId = requestAnimationFrame(renderLoop);

	activeCleanup = () => {
		if (frameId != null) {
			cancelAnimationFrame(frameId);
			frameId = null;
		}

		Runner.stop(runner);
		World.remove(world, mouseConstraint);
		Composite.clear(world, false);
		engine.events = {};

		for (const box of boxes) {
			const snapshot = originalStyles.get(box.element);
			if (!snapshot) continue;

			box.element.style.position = snapshot.position;
			box.element.style.left = snapshot.left;
			box.element.style.top = snapshot.top;
			box.element.style.margin = snapshot.margin;
			box.element.style.width = snapshot.width;
			box.element.style.height = snapshot.height;
			box.element.style.zIndex = snapshot.zIndex;
			box.element.style.boxSizing = snapshot.boxSizing;
			box.element.style.touchAction = snapshot.touchAction;
			box.element.style.transform = snapshot.transform;

			const cleanup = (box.element as GravityElementWithCleanup).__gravityCleanup__;
			cleanup?.();
			delete (box.element as GravityElementWithCleanup).__gravityCleanup__;
		}

		activeCleanup = null;
	};
}

export function stopPhysicsEngine(): void {
	activeCleanup?.();
}
