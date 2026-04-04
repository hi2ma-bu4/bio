import Matter from "matter-js";

// --- 型定義 ---
interface PhysicsBox {
	element: HTMLElement;
	body: Matter.Body;
	w: number;
	h: number;
}

interface PhysicsRect {
	left: number;
	top: number;
	width: number;
	height: number;
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

interface ViewportRect {
	left: number;
	top: number;
	right: number;
	bottom: number;
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

function getElementDepth(element: HTMLElement): number {
	let depth = 0;
	let current: HTMLElement | null = element.parentElement;
	while (current) {
		depth += 1;
		current = current.parentElement;
	}
	return depth;
}

function hasVisualBoxDecoration(style: CSSStyleDeclaration): boolean {
	const backgroundColor = style.backgroundColor;
	const hasBackground = backgroundColor !== "transparent" && backgroundColor !== "rgba(0, 0, 0, 0)";
	const hasBorder =
		parseFloat(style.borderTopWidth) > 0 ||
		parseFloat(style.borderRightWidth) > 0 ||
		parseFloat(style.borderBottomWidth) > 0 ||
		parseFloat(style.borderLeftWidth) > 0;
	const hasPadding =
		parseFloat(style.paddingTop) > 0 ||
		parseFloat(style.paddingRight) > 0 ||
		parseFloat(style.paddingBottom) > 0 ||
		parseFloat(style.paddingLeft) > 0;

	return hasBackground || hasBorder || hasPadding || style.boxShadow !== "none";
}

function getRowCount(rects: DOMRect[]): number {
	const rows: number[] = [];

	rects.forEach((rect) => {
		const centerY = rect.top + rect.height / 2;
		const rowIndex = rows.findIndex((rowCenter) => Math.abs(rowCenter - centerY) <= 4);
		if (rowIndex >= 0) {
			rows[rowIndex] = (rows[rowIndex] + centerY) / 2;
			return;
		}

		rows.push(centerY);
	});

	return rows.length;
}

function getUnionRect(rects: DOMRect[]): PhysicsRect | null {
	if (rects.length === 0) return null;

	let left = rects[0].left;
	let top = rects[0].top;
	let right = rects[0].right;
	let bottom = rects[0].bottom;

	for (let i = 1; i < rects.length; i++) {
		const rect = rects[i];
		left = Math.min(left, rect.left);
		top = Math.min(top, rect.top);
		right = Math.max(right, rect.right);
		bottom = Math.max(bottom, rect.bottom);
	}

	return {
		left,
		top,
		width: right - left,
		height: bottom - top,
	};
}

function getViewportRect(): ViewportRect {
	return {
		left: 0,
		top: 0,
		right: window.innerWidth,
		bottom: window.innerHeight,
	};
}

function intersectsViewport(rect: DOMRect, viewport: ViewportRect): boolean {
	return rect.right > viewport.left && rect.left < viewport.right && rect.bottom > viewport.top && rect.top < viewport.bottom;
}

function isAriaHidden(element: HTMLElement): boolean {
	let current: HTMLElement | null = element;
	while (current) {
		if (current.getAttribute("aria-hidden") === "true") return true;
		if (current.hidden) return true;
		if (current.hasAttribute("inert")) return true;
		if (current instanceof HTMLDialogElement && !current.open) return true;
		current = current.parentElement;
	}
	return false;
}

function isRenderableElement(element: HTMLElement, viewport: ViewportRect): boolean {
	if (!element.isConnected) return false;
	if (isAriaHidden(element)) return false;

	const style = window.getComputedStyle(element);
	if (style.display === "none") return false;
	if (style.visibility === "hidden" || style.visibility === "collapse") return false;
	if (style.opacity === "0") return false;
	if (style.contentVisibility === "hidden") return false;

	const rect = element.getBoundingClientRect();
	if (rect.width <= 5 || rect.height <= 5) return false;
	if (!intersectsViewport(rect, viewport)) return false;

	return true;
}

function getPhysicsRect(element: HTMLElement): PhysicsRect {
	const rect = element.getBoundingClientRect();
	const fallbackRect: PhysicsRect = {
		left: rect.left,
		top: rect.top,
		width: rect.width,
		height: rect.height,
	};

	if (!hasDirectTextContent(element)) return fallbackRect;
	if (["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "IMG", "DIALOG"].includes(element.tagName)) return fallbackRect;

	const style = window.getComputedStyle(element);
	if (hasVisualBoxDecoration(style)) return fallbackRect;

	const range = document.createRange();
	range.selectNodeContents(element);

	const textRects = Array.from(range.getClientRects()).filter((clientRect) => clientRect.width > 1 && clientRect.height > 1);
	if (textRects.length === 0) return fallbackRect;
	if (getRowCount(textRects) !== 1) return fallbackRect;

	const unionRect = getUnionRect(textRects);
	if (!unionRect) return fallbackRect;

	const right = Math.min(rect.right, unionRect.left + unionRect.width);
	const bottom = Math.min(rect.bottom, unionRect.top + unionRect.height);
	const left = Math.max(rect.left, unionRect.left);
	const top = Math.max(rect.top, unionRect.top);
	const width = right - left;
	const height = bottom - top;

	if (width <= 5 || height <= 5) return fallbackRect;
	if (rect.width - width < 8 && rect.height - height < 4) return fallbackRect;

	return {
		left,
		top,
		width,
		height,
	};
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

		// キーボード操作や el.click() による合成クリックは座標を持たないため、そのまま許可する。
		if (e.detail === 0) {
			return;
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
	const viewport = getViewportRect();
	const selectionLockStyle = document.createElement("style");
	selectionLockStyle.setAttribute("data-gravity-selection-lock", "true");
	selectionLockStyle.textContent = "html, body, body * { user-select: none !important; -webkit-user-select: none !important; }";
	document.head.appendChild(selectionLockStyle);

	// --- ターゲット要素の収集とフィルタリング ---

	const selectorArray: string[] = Array.isArray(selectors) ? selectors : [selectors];
	const selectorString: string = selectorArray.join(", ");

	let rawElements: HTMLElement[] = [];
	try {
		document.querySelectorAll(selectorString).forEach((el) => {
			if (!(el instanceof HTMLElement)) return;
			if (isRenderableElement(el, viewport)) {
				rawElements.push(el);
			}
		});
	} catch (e) {
		selectionLockStyle.remove();
		console.error("Invalid CSS selector provided:", e);
		return;
	}

	// フィルタリング (親テキスト優先ロジック)
	const filteredElements: HTMLElement[] = rawElements.filter((parent) => {
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

	const selectedElements = new Set(filteredElements);
	const elements: HTMLElement[] = [...filteredElements]
		.sort((a, b) => getElementDepth(a) - getElementDepth(b))
		.filter((element) => {
			let ancestor = element.parentElement;
			while (ancestor) {
				if (selectedElements.has(ancestor)) {
					return false;
				}
				ancestor = ancestor.parentElement;
			}
			return true;
		});

	const boxes: PhysicsBox[] = [];
	const originalStyles = new Map<HTMLElement, ElementSnapshot>();

	elements.forEach((el) => {
		const physicsRect = getPhysicsRect(el);
		const w: number = physicsRect.width;
		const h: number = physicsRect.height;
		const x: number = physicsRect.left + w / 2;
		const y: number = physicsRect.top + h / 2;

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
		Engine.clear(engine);
		selectionLockStyle.remove();

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
