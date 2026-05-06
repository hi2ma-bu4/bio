type AttributeName = "title" | "placeholder";
type RandomizeString = () => string;

interface RandomBucketSlot {
	bucket: readonly string[];
	originalIndex: number;
}

type RandomSlot = string | RandomBucketSlot;

interface RenderState {
	original: string;
	lastRendered: string;
	randomize: RandomizeString;
}

interface ManagedElementState {
	attributes: Partial<Record<AttributeName, RenderState>>;
	value?: RenderState;
}

const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "TITLE"]);
const VALUE_INPUT_TYPES = new Set(["button", "submit", "reset"]);
const CANDIDATE_RANGES: ReadonlyArray<readonly [number, number]> = [
	[0x21, 0x7e],
	[0xa1, 0xff],
	[0x100, 0x24f],
	[0x250, 0x2af],
	[0x3001, 0x303f],
	[0x3041, 0x309f],
	[0x30a1, 0x30ff],
	[0x370, 0x4ff],
	[0x4e00, 0x4eff],
	[0x1e00, 0x1eff],
	[0xff01, 0xff60],
	[0xff61, 0xff9f],
];
const CANDIDATE_CHARS = Array.from(
	new Set(
		CANDIDATE_RANGES.flatMap(([start, end]) => {
			const chars: string[] = [];
			for (let codePoint = start; codePoint <= end; codePoint += 1) {
				const char = String.fromCodePoint(codePoint);
				if (/\s/u.test(char)) continue;
				chars.push(char);
			}
			return chars;
		}),
	),
);

let activeController: RandomEffectController | null = null;

/**
 * 文字が空白文字かどうかを判定する
 * @param char - 対象の文字
 * @returns 空白文字であれば true
 */
function isWhitespace(char: string): boolean {
	return /\s/u.test(char);
}

/**
 * スタイルオブジェクトからフォント設定値を解決する
 * @param style - CSSスタイル
 * @returns フォント設定文字列
 */
function resolveFontValue(style: CSSStyleDeclaration): string {
	return style.font || `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} / ${style.lineHeight} ${style.fontFamily}`;
}

/**
 * テキストノードがレンダリング対象かどうかを判定する
 * @param node - 対象のテキストノード
 * @returns レンダリング対象であれば true
 */
function isRenderableTextNode(node: Text): boolean {
	const parent = node.parentElement;
	if (!parent) return false;
	if (SKIPPED_TAGS.has(parent.tagName)) return false;
	if (!node.textContent?.trim()) return false;
	return true;
}

/**
 * 要素のvalue属性を管理対象とするかどうかを判定する
 * @param element - 対象の要素
 * @returns 管理対象であれば true
 */
function isValueManagedInput(element: Element): element is HTMLInputElement {
	return element instanceof HTMLInputElement && VALUE_INPUT_TYPES.has(element.type.toLowerCase());
}

/**
 * フォントごとの文字幅プロファイルを管理するクラス
 */
class WidthProfile {
	/** 計測用コンテキスト */
	private readonly context: CanvasRenderingContext2D | null;
	/** 幅ごとの文字バケット */
	private readonly widthBuckets = new Map<string, readonly string[]>();
	/** 文字幅のキャッシュ */
	private readonly widthCache = new Map<string, string>();

	/**
	 * コンストラクタ
	 * @param font - フォント設定文字列
	 */
	constructor(font: string) {
		const canvas = document.createElement("canvas");
		this.context = canvas.getContext("2d");
		if (!this.context) return;

		this.context.font = font;
		this.buildWidthBuckets();
	}

	/**
	 * 文字列をランダム化するための関数を生成する
	 * @param source - 元の文字列
	 * @returns ランダム化関数
	 */
	createRandomizer(source: string): RandomizeString {
		const slots = Array.from(source, (char) => this.createSlot(char));
		const buffer = new Array<string>(slots.length);

		return () => {
			for (let i = 0; i < slots.length; i += 1) {
				const slot = slots[i];
				buffer[i] = typeof slot === "string" ? slot : this.pickFromBucket(slot);
			}
			return buffer.join("");
		};
	}

	/**
	 * 文字幅ごとのバケットを構築する
	 */
	private buildWidthBuckets(): void {
		const mutableBuckets = new Map<string, string[]>();

		for (const char of CANDIDATE_CHARS) {
			const widthKey = this.measureWidthKey(char);
			if (!widthKey) continue;

			const bucket = mutableBuckets.get(widthKey);
			if (bucket) {
				bucket.push(char);
			} else {
				mutableBuckets.set(widthKey, [char]);
			}
		}

		for (const [widthKey, bucket] of mutableBuckets) {
			this.widthBuckets.set(widthKey, bucket);
		}
	}

	/**
	 * 指定した文字の置換スロットを作成する
	 * @param char - 対象の文字
	 * @returns スロット情報
	 */
	private createSlot(char: string): RandomSlot {
		if (isWhitespace(char)) return char;

		const widthKey = this.measureWidthKey(char);
		if (!widthKey) return char;

		const bucket = this.widthBuckets.get(widthKey);
		if (!bucket || bucket.length === 0) return char;
		if (bucket.length === 1 && bucket[0] === char) return char;

		return {
			bucket,
			originalIndex: bucket.indexOf(char),
		};
	}

	/**
	 * バケットからランダムに文字を選択する
	 * @param slot - バケット情報
	 * @returns 選択された文字
	 */
	private pickFromBucket(slot: RandomBucketSlot): string {
		const { bucket, originalIndex } = slot;
		if (bucket.length === 0) return "";
		if (bucket.length === 1) return bucket[0] ?? "";

		let index = Math.floor(Math.random() * bucket.length);
		if (index === originalIndex) {
			index = (index + 1 + Math.floor(Math.random() * (bucket.length - 1))) % bucket.length;
		}

		return bucket[index] ?? bucket[0] ?? "";
	}

	/**
	 * 文字幅を計測し、キーを取得する
	 * @param char - 対象の文字
	 * @returns 幅キー
	 */
	private measureWidthKey(char: string): string | null {
		const cached = this.widthCache.get(char);
		if (cached) return cached;
		if (!this.context) return null;

		const width = this.context.measureText(char).width;
		const widthKey = Number.isFinite(width) ? String(width) : null;
		if (widthKey) {
			this.widthCache.set(char, widthKey);
		}
		return widthKey;
	}
}

/**
 * ランダム文字エフェクトを制御するクラス
 */
class RandomEffectController {
	/** アニメーションフレームID */
	private frameId: number | null = null;
	/** 変更監視用オブザーバー */
	private observer: MutationObserver | null = null;
	/** 適用中フラグ（無限ループ防止用） */
	private isApplying = false;
	/** 管理対象のテキストノード */
	private readonly textNodes = new Map<Text, RenderState>();
	/** 管理対象の要素属性 */
	private readonly managedElements = new Map<HTMLElement, ManagedElementState>();
	/** フォントごとの幅プロファイル */
	private readonly widthProfiles = new Map<string, WidthProfile>();
	/** ドキュメントタイトルの状態 */
	private titleState: RenderState | null = null;

	/**
	 * エフェクトを開始する
	 */
	start(): void {
		this.collectFromNode(document.documentElement);
		this.captureDocumentTitle();
		this.render();

		this.observer = new MutationObserver((mutations) => {
			if (this.isApplying) return;

			for (const mutation of mutations) {
				if (mutation.type === "childList") {
					mutation.addedNodes.forEach((node) => this.collectFromNode(node));
					mutation.removedNodes.forEach((node) => this.cleanupRemovedNode(node));
					continue;
				}

				if (mutation.type === "characterData") {
					const target = mutation.target;
					if (!(target instanceof Text) || !target.isConnected) continue;
					if (!isRenderableTextNode(target)) {
						this.textNodes.delete(target);
						continue;
					}
					this.textNodes.set(target, this.createRenderState(target.textContent ?? "", target.parentElement));
					continue;
				}

				if (mutation.type === "attributes" && mutation.target instanceof HTMLElement) {
					this.captureElementState(mutation.target);
				}
			}
		});

		this.observer.observe(document.documentElement, {
			subtree: true,
			childList: true,
			characterData: true,
			attributes: true,
			attributeFilter: ["title", "placeholder", "value", "type"],
		});
	}

	/**
	 * エフェクトを停止し、元の状態に戻す
	 */
	stop(): void {
		if (this.frameId != null) {
			cancelAnimationFrame(this.frameId);
			this.frameId = null;
		}
		this.observer?.disconnect();
		this.observer = null;
		this.restoreOriginals();
	}

	/** 描画ループ */
	private render = (): void => {
		this.isApplying = true;

		for (const [node, state] of this.textNodes) {
			if (!node.isConnected || !isRenderableTextNode(node)) {
				this.textNodes.delete(node);
				continue;
			}
			const rendered = state.randomize();
			state.lastRendered = rendered;
			node.textContent = rendered;
		}

		for (const [element, state] of this.managedElements) {
			if (!element.isConnected) {
				this.managedElements.delete(element);
				continue;
			}

			for (const attributeName of Object.keys(state.attributes) as AttributeName[]) {
				const attributeState = state.attributes[attributeName];
				if (!attributeState) continue;
				const rendered = attributeState.randomize();
				attributeState.lastRendered = rendered;
				element.setAttribute(attributeName, rendered);
			}

			if (state.value && isValueManagedInput(element)) {
				const rendered = state.value.randomize();
				state.value.lastRendered = rendered;
				element.value = rendered;
			}
		}

		if (this.titleState) {
			if (document.title !== this.titleState.lastRendered) {
				this.titleState = this.createRenderState(document.title, document.body ?? document.documentElement);
			}
			const rendered = this.titleState.randomize();
			this.titleState.lastRendered = rendered;
			document.title = rendered;
		}

		this.isApplying = false;
		this.frameId = requestAnimationFrame(this.render);
	};

	/**
	 * 元の文字列を復元する
	 */
	private restoreOriginals(): void {
		this.isApplying = true;

		for (const [node, state] of this.textNodes) {
			if (!node.isConnected) continue;
			node.textContent = state.original;
		}

		for (const [element, state] of this.managedElements) {
			if (!element.isConnected) continue;

			for (const attributeName of Object.keys(state.attributes) as AttributeName[]) {
				const attributeState = state.attributes[attributeName];
				if (!attributeState) continue;
				element.setAttribute(attributeName, attributeState.original);
			}

			if (state.value && isValueManagedInput(element)) {
				element.value = state.value.original;
			}
		}

		if (this.titleState) {
			document.title = this.titleState.original;
		}

		this.isApplying = false;
	}

	/**
	 * ノードから管理対象を収集する
	 * @param node - 対象のノード
	 */
	private collectFromNode(node: Node): void {
		if (node instanceof Text) {
			this.captureTextNode(node);
			return;
		}

		if (!(node instanceof Element)) return;
		if (SKIPPED_TAGS.has(node.tagName)) return;

		if (node instanceof HTMLElement) {
			this.captureElementState(node);
		}

		const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
		let currentNode = walker.nextNode();
		while (currentNode) {
			if (currentNode instanceof Text) {
				this.captureTextNode(currentNode);
			}
			currentNode = walker.nextNode();
		}

		if (node instanceof HTMLElement) {
			node.querySelectorAll<HTMLElement>("[title], [placeholder], input[type='button'], input[type='submit'], input[type='reset']").forEach((element) => {
				this.captureElementState(element);
			});
		}
	}

	/**
	 * 削除されたノードを管理対象から外す
	 * @param node - 削除されたノード
	 */
	private cleanupRemovedNode(node: Node): void {
		if (node instanceof Text) {
			this.textNodes.delete(node);
			return;
		}

		if (!(node instanceof Element)) return;

		if (node instanceof HTMLElement) {
			this.managedElements.delete(node);
		}

		const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
		let currentNode = walker.nextNode();
		while (currentNode) {
			if (currentNode instanceof Text) {
				this.textNodes.delete(currentNode);
			}
			currentNode = walker.nextNode();
		}

		node.querySelectorAll<HTMLElement>("*").forEach((element) => {
			this.managedElements.delete(element);
		});
	}

	/**
	 * テキストノードをキャプチャし管理対象に追加する
	 * @param node - 対象のテキストノード
	 */
	private captureTextNode(node: Text): void {
		if (!isRenderableTextNode(node)) {
			this.textNodes.delete(node);
			return;
		}

		const currentText = node.textContent ?? "";
		const existing = this.textNodes.get(node);
		if (existing && currentText === existing.lastRendered) {
			return;
		}

		this.textNodes.set(node, {
			...this.createRenderState(currentText, node.parentElement),
			lastRendered: currentText,
		});
	}

	/**
	 * 要素の属性や状態をキャプチャし管理対象に追加する
	 * @param element - 対象の要素
	 */
	private captureElementState(element: HTMLElement): void {
		const attributes: ManagedElementState["attributes"] = {};

		for (const attributeName of ["title", "placeholder"] as AttributeName[]) {
			if (!element.hasAttribute(attributeName)) continue;
			const currentValue = element.getAttribute(attributeName) ?? "";
			const previousState = this.managedElements.get(element)?.attributes[attributeName];
			if (previousState && currentValue === previousState.lastRendered) {
				attributes[attributeName] = previousState;
				continue;
			}
			attributes[attributeName] = this.createRenderState(currentValue, element);
		}

		let valueState: RenderState | undefined;
		if (isValueManagedInput(element)) {
			const currentValue = element.value;
			const previousValue = this.managedElements.get(element)?.value;
			if (previousValue && currentValue === previousValue.lastRendered) {
				valueState = previousValue;
			} else {
				valueState = this.createRenderState(currentValue, element);
			}
		}

		if (Object.keys(attributes).length === 0 && !valueState) {
			this.managedElements.delete(element);
			return;
		}

		this.managedElements.set(element, {
			attributes,
			value: valueState,
		});
	}

	/**
	 * ドキュメントタイトルをキャプチャする
	 */
	private captureDocumentTitle(): void {
		const currentTitle = document.title;
		if (!currentTitle) {
			this.titleState = null;
			return;
		}

		if (this.titleState && currentTitle === this.titleState.lastRendered) {
			return;
		}

		this.titleState = this.createRenderState(currentTitle, document.body ?? document.documentElement);
	}

	/**
	 * レンダリング状態オブジェクトを作成する
	 * @param original - 元の文字列
	 * @param styleSource - フォントスタイルの参照元要素
	 * @returns レンダリング状態
	 */
	private createRenderState(original: string, styleSource: Element | null): RenderState {
		const widthProfile = this.getWidthProfile(styleSource);
		return {
			original,
			lastRendered: original,
			randomize: widthProfile.createRandomizer(original),
		};
	}

	/**
	 * 要素のフォントに対応する幅プロファイルを取得または作成する
	 * @param styleSource - 参照元要素
	 * @returns 幅プロファイル
	 */
	private getWidthProfile(styleSource: Element | null): WidthProfile {
		const target = styleSource ?? document.body ?? document.documentElement;
		const style = getComputedStyle(target);
		const font = resolveFontValue(style);
		const cached = this.widthProfiles.get(font);
		if (cached) return cached;

		const profile = new WidthProfile(font);
		this.widthProfiles.set(font, profile);
		return profile;
	}
}

/**
 * ランダムエフェクトを開始する
 */
export function startRandomEffect(): void {
	activeController?.stop();
	activeController = new RandomEffectController();
	activeController.start();
}

/**
 * ランダムエフェクトを停止する
 */
export function stopRandomEffect(): void {
	activeController?.stop();
	activeController = null;
}
