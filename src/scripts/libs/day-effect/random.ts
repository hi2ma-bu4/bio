type AttributeName = "title" | "placeholder";
type RandomizeString = (source: string) => string;

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
	[0x3001, 0x303f],
	[0x3041, 0x309f],
	[0x30a1, 0x30ff],
	[0x4e00, 0x4eff],
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
		})
	)
);

let activeController: RandomEffectController | null = null;

function isWhitespace(char: string): boolean {
	return /\s/u.test(char);
}

function randomItem<T>(items: readonly T[]): T | undefined {
	return items[Math.floor(Math.random() * items.length)];
}

function resolveFontValue(style: CSSStyleDeclaration): string {
	return style.font || `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} / ${style.lineHeight} ${style.fontFamily}`;
}

function isRenderableTextNode(node: Text): boolean {
	const parent = node.parentElement;
	if (!parent) return false;
	if (SKIPPED_TAGS.has(parent.tagName)) return false;
	if (!node.textContent?.trim()) return false;
	return true;
}

function isValueManagedInput(element: Element): element is HTMLInputElement {
	return element instanceof HTMLInputElement && VALUE_INPUT_TYPES.has(element.type.toLowerCase());
}

class WidthProfile {
	private readonly context: CanvasRenderingContext2D | null;
	private readonly widthBuckets = new Map<string, string[]>();
	private readonly widthCache = new Map<string, string>();

	constructor(font: string) {
		const canvas = document.createElement("canvas");
		this.context = canvas.getContext("2d");
		if (!this.context) return;

		this.context.font = font;
		this.buildWidthBuckets();
	}

	randomizeString = (source: string): string => {
		return Array.from(source, (char) => this.randomizeChar(char)).join("");
	};

	private buildWidthBuckets(): void {
		for (const char of CANDIDATE_CHARS) {
			const widthKey = this.measureWidthKey(char);
			if (!widthKey) continue;

			const bucket = this.widthBuckets.get(widthKey);
			if (bucket) {
				bucket.push(char);
			} else {
				this.widthBuckets.set(widthKey, [char]);
			}
		}
	}

	private randomizeChar(char: string): string {
		if (isWhitespace(char)) return char;

		const widthKey = this.measureWidthKey(char);
		if (!widthKey) return char;

		const bucket = this.widthBuckets.get(widthKey);
		if (!bucket || bucket.length === 0) return char;
		if (bucket.length === 1) return bucket[0] ?? char;

		let next = randomItem(bucket) ?? char;
		if (next === char) {
			const currentIndex = bucket.indexOf(char);
			if (currentIndex >= 0) {
				next = bucket[(currentIndex + 1 + Math.floor(Math.random() * (bucket.length - 1))) % bucket.length] ?? char;
			}
		}
		return next;
	}

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

class RandomEffectController {
	private frameId: number | null = null;
	private observer: MutationObserver | null = null;
	private isApplying = false;
	private readonly textNodes = new Map<Text, RenderState>();
	private readonly managedElements = new Map<HTMLElement, ManagedElementState>();
	private readonly widthProfiles = new Map<string, WidthProfile>();
	private titleState: RenderState | null = null;

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

	stop(): void {
		if (this.frameId != null) {
			cancelAnimationFrame(this.frameId);
			this.frameId = null;
		}
		this.observer?.disconnect();
		this.observer = null;
		this.restoreOriginals();
	}

	private render = (): void => {
		this.isApplying = true;

		for (const [node, state] of this.textNodes) {
			if (!node.isConnected || !isRenderableTextNode(node)) {
				this.textNodes.delete(node);
				continue;
			}
			const rendered = state.randomize(state.original);
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
				const rendered = attributeState.randomize(attributeState.original);
				attributeState.lastRendered = rendered;
				element.setAttribute(attributeName, rendered);
			}

			if (state.value && isValueManagedInput(element)) {
				const rendered = state.value.randomize(state.value.original);
				state.value.lastRendered = rendered;
				element.value = rendered;
			}
		}

		if (this.titleState) {
			if (document.title !== this.titleState.lastRendered) {
				this.titleState.original = document.title;
			}
			const rendered = this.titleState.randomize(this.titleState.original);
			this.titleState.lastRendered = rendered;
			document.title = rendered;
		}

		this.isApplying = false;
		this.frameId = requestAnimationFrame(this.render);
	};

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

	private createRenderState(original: string, styleSource: Element | null): RenderState {
		const widthProfile = this.getWidthProfile(styleSource);
		return {
			original,
			lastRendered: original,
			randomize: widthProfile.randomizeString,
		};
	}

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

export function startRandomEffect(): void {
	activeController?.stop();
	activeController = new RandomEffectController();
	activeController.start();
}

export function stopRandomEffect(): void {
	activeController?.stop();
	activeController = null;
}
