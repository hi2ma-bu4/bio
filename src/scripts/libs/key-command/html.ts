function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

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

function buildStyle(style: CSSStyleDeclaration): string {
	let css = "";
	css = addStyle(css, "color", style.color);
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

	css = addStyle(css, "font-style", style.fontStyle);
	css = addStyle(css, "font-variant", style.fontVariant);
	css = addStyle(css, "font-weight", style.fontWeight);
	css = addStyle(css, "font-stretch", style.fontStretch);
	css = addStyle(css, "font-size", style.fontSize);
	css = addStyle(css, "line-height", style.lineHeight);
	css = addStyle(css, "font-family", style.fontFamily.replace(/,\s*$/, "").replace(/"/g, "'"));

	css = addStyle(css, "letter-spacing", style.letterSpacing);
	css = addStyle(css, "word-spacing", style.wordSpacing);

	css = addStyle(css, "text-decoration", style.textDecoration);
	css = addStyle(css, "text-transform", style.textTransform);

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

function serializeNode(node: ChildNode): string {
	switch (node.nodeType) {
		case Node.TEXT_NODE:
			return escapeHtml(node.nodeValue ?? "");

		case Node.COMMENT_NODE:
			return `&lt;!--${escapeHtml(node.nodeValue ?? "")}--&gt;`;

		case Node.ELEMENT_NODE: {
			const element = node as Element;
			const tag = element.tagName.toLowerCase();
			const style = getComputedStyle(element);
			const css = buildStyle(style);
			const attrs = tag === "a" ? pickAnchorAttrs(element) : pickAllAttrs(element);

			if (tag === "svg" && element instanceof SVGElement) {
				const svgHtml = sanitizeSvg(element);
				const svgEscaped = escapeHtml(element.outerHTML);
				return `<span ${attrs}>${svgHtml}<span>${svgEscaped}</span></span>`;
			}

			let inner = "";
			for (const child of Array.from(element.childNodes)) {
				inner += serializeNode(child);
			}

			const open = `&lt;${tag}${attrs}&gt;`;
			const close = `&lt;/${tag}&gt;`;
			const content = open + inner + close;

			if (tag === "a") {
				return `<a${attrs} style="${css}">${content}</a>`;
			}

			return css ? `<span style="${css}">${content}</span>` : content;
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

export async function renderPageAsHtml(): Promise<void> {
	await waitForPageLoad();

	let output = "";
	for (const node of Array.from(document.body.childNodes)) {
		output += serializeNode(node);
	}

	document.body.innerHTML = `<pre style="white-space:normal;line-break:anywhere;overflow-wrap:anywhere;">${output}</pre>`;
}
