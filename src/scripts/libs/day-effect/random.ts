type AttributeName = "title" | "placeholder";

interface AttributeState {
	original: string;
	lastRendered: string;
}

interface ManagedElementState {
	attributes: Partial<Record<AttributeName, AttributeState>>;
	value?: AttributeState;
}

const HALF_WIDTH_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
const FULL_WIDTH_CHARS =
	"０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわをんァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヲンー、。・！？”’（）［］｛｝＜＞「」【】〜＝＋＿％＆＊";

const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "TITLE"]);
const VALUE_INPUT_TYPES = new Set(["button", "submit", "reset"]);

let activeController: RandomEffectController | null = null;

function isWhitespace(char: string): boolean {
	return /\s/u.test(char);
}

function isHalfWidthChar(char: string): boolean {
	const codePoint = char.codePointAt(0);
	if (codePoint == null) return false;

	if ((codePoint >= 0x20 && codePoint <= 0x7e) || (codePoint >= 0xa1 && codePoint <= 0xff)) {
		return true;
	}

	return codePoint >= 0xff61 && codePoint <= 0xff9f;
}

function randomChar(pool: string): string {
	return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}

function randomizeString(source: string): string {
	return Array.from(source, (char) => {
		if (isWhitespace(char)) return char;
		return isHalfWidthChar(char) ? randomChar(HALF_WIDTH_CHARS) : randomChar(FULL_WIDTH_CHARS);
	}).join("");
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

class RandomEffectController {
	private frameId: number | null = null;
	private observer: MutationObserver | null = null;
	private isApplying = false;
	private readonly textNodes = new Map<Text, { original: string; lastRendered: string }>();
	private readonly managedElements = new Map<HTMLElement, ManagedElementState>();
	private titleState: AttributeState | null = null;

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
					this.textNodes.set(target, {
						original: target.textContent ?? "",
						lastRendered: target.textContent ?? "",
					});
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
			const rendered = randomizeString(state.original);
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
				const rendered = randomizeString(attributeState.original);
				attributeState.lastRendered = rendered;
				element.setAttribute(attributeName, rendered);
			}

			if (state.value && isValueManagedInput(element)) {
				const rendered = randomizeString(state.value.original);
				state.value.lastRendered = rendered;
				element.value = rendered;
			}
		}

		if (this.titleState) {
			if (document.title !== this.titleState.lastRendered) {
				this.titleState.original = document.title;
			}
			const rendered = randomizeString(this.titleState.original);
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
			original: currentText,
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
			attributes[attributeName] = {
				original: currentValue,
				lastRendered: currentValue,
			};
		}

		let valueState: AttributeState | undefined;
		if (isValueManagedInput(element)) {
			const currentValue = element.value;
			const previousValue = this.managedElements.get(element)?.value;
			if (previousValue && currentValue === previousValue.lastRendered) {
				valueState = previousValue;
			} else {
				valueState = {
					original: currentValue,
					lastRendered: currentValue,
				};
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

		this.titleState = {
			original: currentTitle,
			lastRendered: currentTitle,
		};
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
