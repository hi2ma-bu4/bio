const AFTERIMAGE_ATTR = "data-page-afterimage";
const MAIN_SELECTOR = "main";
const ACTIVE_CLASS = "is-active";
const CLEANUP_DELAY = 500;

type AstroBeforeSwapEvent = Event & {
	newDocument: Document;
};

let pendingSnapshot: HTMLElement | null = null;

function shouldSkipAfterimage(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cleanupAfterimages(root: ParentNode = document): void {
	root.querySelectorAll<HTMLElement>(`[${AFTERIMAGE_ATTR}]`).forEach((element) => element.remove());
}

function createSnapshot(): HTMLElement | null {
	const source = document.querySelector(MAIN_SELECTOR);
	if (!(source instanceof HTMLElement)) return null;

	const rect = source.getBoundingClientRect();
	if (rect.width < 1 || rect.height < 1) return null;

	const wrapper = document.createElement("div");
	const clone = source.cloneNode(true);
	if (!(clone instanceof HTMLElement)) return null;

	clone.querySelectorAll<HTMLElement>("[id]").forEach((element) => element.removeAttribute("id"));
	clone.setAttribute("aria-hidden", "true");

	wrapper.setAttribute(AFTERIMAGE_ATTR, "");
	wrapper.setAttribute("aria-hidden", "true");
	wrapper.appendChild(clone);

	Object.assign(wrapper.style, {
		position: "fixed",
		left: `${Math.max(rect.left, 0)}px`,
		top: `${Math.max(rect.top, 0)}px`,
		width: `${rect.width}px`,
		height: `${rect.height}px`,
		pointerEvents: "none",
		overflow: "hidden",
		zIndex: "25",
		opacity: "0",
	} satisfies Partial<CSSStyleDeclaration>);

	return wrapper;
}

function prepareAfterimage(): void {
	pendingSnapshot = shouldSkipAfterimage() ? null : createSnapshot();
}

function transferSnapshot(event: AstroBeforeSwapEvent): void {
	if (!pendingSnapshot || shouldSkipAfterimage()) {
		pendingSnapshot = null;
		return;
	}

	cleanupAfterimages(event.newDocument);

	const importedSnapshot = event.newDocument.importNode(pendingSnapshot, true) as HTMLElement;
	event.newDocument.body.appendChild(importedSnapshot);
	pendingSnapshot = null;
}

function activateAfterimage(): void {
	const snapshot = document.querySelector<HTMLElement>(`[${AFTERIMAGE_ATTR}]`);
	if (!snapshot) return;

	requestAnimationFrame(() => {
		snapshot.classList.add(ACTIVE_CLASS);
	});

	window.setTimeout(() => {
		snapshot.remove();
	}, CLEANUP_DELAY);
}

if (typeof document !== "undefined") {
	const supportsViewTransition = "startViewTransition" in (document as Document & { startViewTransition?: unknown });
	if (!supportsViewTransition) {
		document.addEventListener("astro:before-preparation", prepareAfterimage);
		document.addEventListener("astro:before-swap", (event: Event) => transferSnapshot(event as AstroBeforeSwapEvent));
		document.addEventListener("astro:after-swap", activateAfterimage);
	}
}
