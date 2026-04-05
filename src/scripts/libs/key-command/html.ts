function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

const RENDER_HOVER_CLASS = "__html-render-hover__";
const RENDER_ID_ATTR = "data-render-hover-id";
const RENDER_BASE_STYLE_ATTR = "data-render-base-style";
const RENDER_HOVER_STYLE_ATTR = "data-render-hover-style";

function addStyle(
	css: string,
	property: string,
	value: string,
	ignore: string[] = ["normal", "none", "auto"],
): string {
	if (!value) return css;
	if (ignore.includes(value)) return css;
	return css + `${property}:${value};`;
}

function normalizeStyleValue(property: string, value: string): string {
	if (property === "font-family") {
		return value.replace(/,\s*$/, "").replace(/"/g, "'");
	}
	return value;
}

function addInheritedStyle(
	css: string,
	property: string,
	value: string,
	parentValue?: string,
	ignore: string[] = ["normal", "none", "auto"],
): string {
	const normalizedValue = normalizeStyleValue(property, value);
	if (!normalizedValue) return css;
	if (ignore.includes(normalizedValue)) return css;

	const normalizedParentValue = parentValue ? normalizeStyleValue(property, parentValue) : "";
	if (normalizedParentValue && normalizedParentValue === normalizedValue) return css;

	return css + `${property}:${normalizedValue};`;
}

function addStyleProperty(
	css: string,
	style: CSSStyleDeclaration,
	property: string,
	ignore: string[] = ["normal", "none", "auto"],
	parentStyle?: CSSStyleDeclaration | null,
): string {
	return addInheritedStyle(
		css,
		property,
		style.getPropertyValue(property),
		parentStyle?.getPropertyValue(property),
		ignore,
	);
}

function buildStyle(style: CSSStyleDeclaration, parentStyle: CSSStyleDeclaration | null = null): string {
	let css = "";
	css = addInheritedStyle(css, "color", style.color, parentStyle?.color);
	css = addStyle(css, "background-color", style.backgroundColor, ["rgba(0, 0, 0, 0)"]);

	if (style.backgroundImage && style.backgroundImage !== "none") {
		css += `background-image:${style.backgroundImage};`;
		css += `background-size:${style.backgroundSize};`;
		css += `background-position:${style.backgroundPosition};`;
		css += `background-repeat:${style.backgroundRepeat};`;
		css += `background-origin:${style.backgroundOrigin};`;
		css += `background-clip:${style.backgroundClip};`;
		css += `-webkit-background-clip:${style.backgroundClip};`;
		if (style.backgroundClip === "text") {
			css += "-webkit-text-fill-color:transparent;";
		}
	}

	css = addStyle(css, "filter", style.filter);
	css = addStyle(css, "backdrop-filter", style.backdropFilter);
	css = addStyle(css, "text-shadow", style.textShadow);
	css = addStyle(css, "box-shadow", style.boxShadow);

	css = addInheritedStyle(css, "font-style", style.fontStyle, parentStyle?.fontStyle);
	css = addInheritedStyle(css, "font-variant", style.fontVariant, parentStyle?.fontVariant);
	css = addInheritedStyle(css, "font-weight", style.fontWeight, parentStyle?.fontWeight);
	css = addInheritedStyle(css, "font-stretch", style.fontStretch, parentStyle?.fontStretch);
	css = addInheritedStyle(css, "font-size", style.fontSize, parentStyle?.fontSize);
	css = addStyleProperty(css, style, "font-size-adjust", ["normal", "none", "auto"], parentStyle);
	css = addInheritedStyle(css, "line-height", style.lineHeight, parentStyle?.lineHeight);
	css = addInheritedStyle(css, "font-family", style.fontFamily, parentStyle?.fontFamily);
	css = addStyleProperty(css, style, "font-kerning", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-optical-sizing", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-feature-settings", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-variation-settings", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-palette", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-synthesis", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-synthesis-weight", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-synthesis-style", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-synthesis-small-caps", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-synthesis-position", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-variant-ligatures", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-variant-caps", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-variant-numeric", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-variant-east-asian", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "font-variant-position", ["normal", "none", "auto"], parentStyle);

	css = addInheritedStyle(css, "letter-spacing", style.letterSpacing, parentStyle?.letterSpacing);
	css = addInheritedStyle(css, "word-spacing", style.wordSpacing, parentStyle?.wordSpacing);

	css = addStyle(css, "text-decoration", style.textDecoration);
	css = addStyleProperty(css, style, "text-decoration-line", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "text-decoration-style", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "text-decoration-color", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "text-decoration-thickness", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "text-underline-offset", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "text-underline-position", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "text-decoration-skip-ink", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "text-emphasis", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "text-emphasis-style", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "text-emphasis-color", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "text-emphasis-position", ["normal", "none", "auto"], parentStyle);
	css = addInheritedStyle(css, "text-transform", style.textTransform, parentStyle?.textTransform);
	css = addStyleProperty(css, style, "text-rendering", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "-webkit-text-fill-color", ["rgba(0, 0, 0, 0)"], parentStyle);
	css = addStyleProperty(css, style, "-webkit-text-stroke", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "-webkit-text-stroke-width", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "-webkit-text-stroke-color", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "cursor", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "caret-color", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "accent-color", ["normal", "none", "auto"], parentStyle);
	css = addStyleProperty(css, style, "outline");
	css = addStyleProperty(css, style, "outline-color");
	css = addStyleProperty(css, style, "outline-style");
	css = addStyleProperty(css, style, "outline-width");
	css = addStyleProperty(css, style, "outline-offset");
	css = addStyleProperty(css, style, "appearance");
	css = addStyleProperty(css, style, "-webkit-appearance");

	css = addStyle(css, "opacity", style.opacity, ["1"]);
	css = addStyle(css, "visibility", style.visibility, ["visible"]);
	css = addStyle(css, "mix-blend-mode", style.mixBlendMode);
	css = addStyle(css, "isolation", style.isolation);

	return css;
}

function sanitizeSvg(svg: SVGElement): string {
	const clone = svg.cloneNode(true) as SVGElement;
	clone.querySelectorAll("script").forEach((element) => element.remove());
	clone.querySelectorAll("*").forEach((element) => {
		for (const attribute of Array.from(element.attributes)) {
			if (attribute.name.startsWith("on")) {
				element.removeAttribute(attribute.name);
			}
		}
	});
	clone.style.display = "inline-block";
	return clone.outerHTML;
}

function pickAnchorAttrs(node: Element): string {
	const allow = new Set([
		"href",
		"target",
		"rel",
		"download",
		"hreflang",
		"type",
		"referrerpolicy",
	]);
	let attrs = "";
	for (const attribute of Array.from(node.attributes)) {
		if (!allow.has(attribute.name)) continue;
		attrs += ` ${attribute.name}="${escapeHtml(attribute.value)}"`;
	}
	return attrs;
}

function pickAllAttrs(node: Element): string {
	let attrs = "";
	for (const attribute of Array.from(node.attributes)) {
		if (attribute.name.startsWith("on")) continue;
		attrs += ` ${attribute.name}="${escapeHtml(attribute.value)}"`;
	}
	return attrs;
}

function buildPreviewAttrs(baseCss: string, hoverCss = ""): string {
	let attrs = "";
	if (baseCss) attrs += ` ${RENDER_BASE_STYLE_ATTR}="${escapeHtml(baseCss)}"`;
	if (hoverCss) attrs += ` ${RENDER_HOVER_STYLE_ATTR}="${escapeHtml(hoverCss)}"`;
	return attrs;
}

function buildStyleAttr(baseCss: string): string {
	return baseCss ? ` style="${escapeHtml(baseCss)}"` : "";
}

function serializeNode(
	node: ChildNode,
	hoverStyles: WeakMap<Element, string>,
	parentStyle: CSSStyleDeclaration | null = null,
): string {
	switch (node.nodeType) {
		case Node.TEXT_NODE:
			return escapeHtml(node.nodeValue ?? "");

		case Node.COMMENT_NODE:
			return `&lt;!--${escapeHtml(node.nodeValue ?? "")}--&gt;`;

		case Node.ELEMENT_NODE: {
			const element = node as Element;
			const tag = element.tagName.toLowerCase();
			const style = getComputedStyle(element);
			const baseCss = buildStyle(style, parentStyle);
			const hoverCss = hoverStyles.get(element) ?? "";
			const displayAttrs = pickAllAttrs(element);
			const interactiveAttrs = tag === "a" ? pickAnchorAttrs(element) : displayAttrs;
			const previewAttrs = buildPreviewAttrs(baseCss, hoverCss);
			const styleAttr = buildStyleAttr(baseCss);

			if (tag === "svg" && element instanceof SVGElement) {
				const svgHtml = sanitizeSvg(element);
				const svgEscaped = escapeHtml(element.outerHTML);
				return `<span${interactiveAttrs}${previewAttrs}${styleAttr}>${svgHtml}<span>${svgEscaped}</span></span>`;
			}

			let inner = "";
			for (const child of Array.from(element.childNodes)) {
				inner += serializeNode(child, hoverStyles, style);
			}

			const open = `&lt;${tag}${displayAttrs}&gt;`;
			const close = `&lt;/${tag}&gt;`;
			const content = open + inner + close;

			if (tag === "a") {
				return `<a${interactiveAttrs}${previewAttrs}${styleAttr}>${content}</a>`;
			}

			if (baseCss || hoverCss) {
				return `<span${previewAttrs}${styleAttr}>${content}</span>`;
			}

			return content;
		}

		default:
			return "";
	}
}

async function waitForPageLoad(): Promise<void> {
	if (document.readyState === "complete") return;

	await new Promise<void>((resolve) => {
		window.addEventListener("load", () => resolve(), { once: true });
	});
}

function getAccessibleCssText(): string {
	let cssText = "";

	for (const styleSheet of Array.from(document.styleSheets)) {
		try {
			cssText += Array.from(styleSheet.cssRules, (rule) => rule.cssText).join("\n");
			cssText += "\n";
		}
		catch {
			// Ignore cross-origin or otherwise inaccessible stylesheets.
		}
	}

	return cssText;
}

function rewriteHoverRule(rule: CSSRule): string {
	if (rule instanceof CSSStyleRule) {
		if (!rule.selectorText.includes(":hover")) return "";
		return `${rule.selectorText.replaceAll(":hover", `.${RENDER_HOVER_CLASS}`)} { ${rule.style.cssText} }`;
	}

	if (!hasCssRules(rule)) return "";

	const nested = Array.from(rule.cssRules, rewriteHoverRule).filter(Boolean).join("\n");
	if (!nested) return "";

	const prefix = rule.cssText.slice(0, rule.cssText.indexOf("{")).trim();
	return `${prefix} { ${nested} }`;
}

function getHoverCssText(): string {
	let cssText = "";

	for (const styleSheet of Array.from(document.styleSheets)) {
		try {
			cssText += Array.from(styleSheet.cssRules, rewriteHoverRule).filter(Boolean).join("\n");
			cssText += "\n";
		}
		catch {
			// Ignore cross-origin or otherwise inaccessible stylesheets.
		}
	}

	return cssText;
}

function copyAttributes(source: Element, target: Element): void {
	for (const attribute of Array.from(source.attributes)) {
		target.setAttribute(attribute.name, attribute.value);
	}
}

function hasCssRules(rule: CSSRule): rule is CSSRule & { cssRules: CSSRuleList } {
	return "cssRules" in rule;
}

function getViewportSize(): { width: number; height: number } {
	return {
		width: Math.max(window.innerWidth, document.documentElement.clientWidth, 1),
		height: Math.max(window.innerHeight, document.documentElement.clientHeight, 1),
	};
}

async function collectHoverStyles(): Promise<WeakMap<Element, string>> {
	const elements = Array.from(document.body.querySelectorAll("*"));
	if (!elements.length) return new WeakMap();

	elements.forEach((element, index) => {
		element.setAttribute(RENDER_ID_ATTR, String(index));
	});

	const iframe = document.createElement("iframe");
	const { width, height } = getViewportSize();
	iframe.setAttribute("aria-hidden", "true");
	iframe.width = String(width);
	iframe.height = String(height);
	iframe.tabIndex = -1;
	iframe.style.position = "fixed";
	iframe.style.left = "-10000px";
	iframe.style.top = "0";
	iframe.style.width = `${width}px`;
	iframe.style.height = `${height}px`;
	iframe.style.opacity = "0";
	iframe.style.pointerEvents = "none";

	document.documentElement.appendChild(iframe);

	try {
		const iframeDoc = iframe.contentDocument;
		const iframeWindow = iframe.contentWindow;
		if (!iframeDoc || !iframeWindow) return new WeakMap();

		iframeDoc.open();
		iframeDoc.write("<!DOCTYPE html><html><head></head><body></body></html>");
		iframeDoc.close();

		copyAttributes(document.documentElement, iframeDoc.documentElement);
		copyAttributes(document.body, iframeDoc.body);

		const baseStyle = iframeDoc.createElement("style");
		baseStyle.textContent = getAccessibleCssText();
		iframeDoc.head.appendChild(baseStyle);

		const hoverStyle = iframeDoc.createElement("style");
		hoverStyle.textContent = getHoverCssText();
		iframeDoc.head.appendChild(hoverStyle);

		const bodyClone = document.body.cloneNode(true) as HTMLElement;
		iframeDoc.body.replaceChildren(...Array.from(bodyClone.childNodes));

		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => resolve());
		});

		const hoverStyles = new WeakMap<Element, string>();

		for (const element of elements) {
			const renderId = element.getAttribute(RENDER_ID_ATTR);
			if (!renderId) continue;

			const clone = iframeDoc.querySelector(`[${RENDER_ID_ATTR}="${renderId}"]`);
			if (!clone || clone.nodeType !== Node.ELEMENT_NODE) continue;
			const cloneElement = clone as Element;

			const hoveredNodes: Element[] = [];
			let current: Element | null = cloneElement;
			while (current) {
				current.classList.add(RENDER_HOVER_CLASS);
				hoveredNodes.push(current);
				current = current.parentElement;
			}

			const baseParentStyle = element.parentElement ? getComputedStyle(element.parentElement) : null;
			const hoverParentStyle = cloneElement.parentElement
				? iframeWindow.getComputedStyle(cloneElement.parentElement)
				: null;
			const baseCss = buildStyle(getComputedStyle(element), baseParentStyle);
			const hoverCss = buildStyle(iframeWindow.getComputedStyle(cloneElement), hoverParentStyle);
			if (hoverCss && hoverCss !== baseCss) {
				hoverStyles.set(element, hoverCss);
			}

			for (const hoveredNode of hoveredNodes) {
				hoveredNode.classList.remove(RENDER_HOVER_CLASS);
			}
		}

		return hoverStyles;
	}
	finally {
		for (const element of elements) {
			element.removeAttribute(RENDER_ID_ATTR);
		}
		iframe.remove();
	}
}

function attachHoverPreview(root: ParentNode): void {
	const elements = root.querySelectorAll<HTMLElement>(`[${RENDER_HOVER_STYLE_ATTR}]`);

	for (const element of Array.from(elements)) {
		const baseCss = element.getAttribute(RENDER_BASE_STYLE_ATTR) ?? "";
		const hoverCss = element.getAttribute(RENDER_HOVER_STYLE_ATTR) ?? "";
		if (!hoverCss) continue;

		const applyStyle = (css: string) => {
			if (css) {
				element.setAttribute("style", css);
			}
			else {
				element.removeAttribute("style");
			}
		};

		applyStyle(baseCss);
		element.addEventListener("mouseenter", () => applyStyle(hoverCss));
		element.addEventListener("mouseleave", () => applyStyle(baseCss));
	}
}

export async function renderPageAsHtml(): Promise<void> {
	await waitForPageLoad();
	const hoverStyles = await collectHoverStyles();

	let output = "";
	for (const node of Array.from(document.body.childNodes)) {
		output += serializeNode(node, hoverStyles);
	}

	document.body.innerHTML = `<pre style="white-space:normal;line-break:anywhere;overflow-wrap:anywhere;">${output}</pre>`;
	attachHoverPreview(document.body);
}
