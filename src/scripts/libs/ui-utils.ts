// 共通ユーティリティ: スクロールロックとフォーカストラップ
let _savedBodyStyle: { position: string; top: string; overflow: string } | null = null;
let _scrollTop = 0;

export function lockBodyScroll() {
	_scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
	_savedBodyStyle = {
		position: document.body.style.position || "",
		top: document.body.style.top || "",
		overflow: document.body.style.overflow || "",
	};
	document.body.style.position = "fixed";
	document.body.style.top = `-${_scrollTop}px`;
	document.body.style.overflow = "hidden";
	document.documentElement.classList.add("no-scroll");
}

export function unlockBodyScroll() {
	if (_savedBodyStyle) {
		document.body.style.position = _savedBodyStyle.position;
		document.body.style.top = _savedBodyStyle.top;
		document.body.style.overflow = _savedBodyStyle.overflow;
		window.scrollTo(0, _scrollTop);
		_savedBodyStyle = null;
	}
	document.documentElement.classList.remove("no-scroll");
}

export function getFocusable(el: Element) {
	return Array.from(el.querySelectorAll<HTMLElement>("a,button,input,textarea,select,[tabindex]")).filter((e) => {
		if (e.hasAttribute("disabled")) return false;
		if (e.getAttribute("type") === "hidden") return false;
		return true;
	});
}

// Keyboard helpers
export function isTabKey(e: KeyboardEvent) {
	return e.key === "Tab" || (e as any).keyCode === 9;
}

export function isEnterKey(e: KeyboardEvent) {
	return e.key === "Enter" || (e as any).keyCode === 13;
}

export function isSpaceKey(e: KeyboardEvent) {
	return e.key === " " || e.key === "Space" || (e as any).keyCode === 32;
}
export function isEscapeKey(e: KeyboardEvent) {
	return e.key === "Escape" || e.key === "Esc" || (e as any).keyCode === 27;
}

// Activation keys for controls: Enter or Space
export function isActivationKey(e: KeyboardEvent) {
	return isEnterKey(e) || isSpaceKey(e);
}

export function createFocusTrap(nav: HTMLElement) {
	let _keydownHandler: ((e: KeyboardEvent) => void) | null = null;

	function activate() {
		if (!nav) return;
		_keydownHandler = (e: KeyboardEvent) => {
			if (!isTabKey(e)) return;
			const focusables = getFocusable(nav);
			if (focusables.length === 0) {
				e.preventDefault();
				return;
			}
			const first = focusables[0];
			const last = focusables[focusables.length - 1];
			const active = document.activeElement as HTMLElement | null;

			if (e.shiftKey) {
				if (!active || active === first || !nav.contains(active)) {
					e.preventDefault();
					last.focus();
				}
			} else {
				if (!active || active === last || !nav.contains(active)) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener("keydown", _keydownHandler);
	}

	function deactivate() {
		if (_keydownHandler) {
			document.removeEventListener("keydown", _keydownHandler);
			_keydownHandler = null;
		}
	}

	function focusFirst() {
		const focusables = getFocusable(nav);
		if (focusables.length > 0) focusables[0].focus();
	}

	return { activate, deactivate, focusFirst };
}

export function addEscapeListener(onClose: () => void) {
	const _handler = (e: KeyboardEvent) => {
		if (!isEscapeKey(e)) return;
		onClose();
	};

	document.addEventListener("keydown", _handler);

	return () => {
		document.removeEventListener("keydown", _handler);
	};
}

export async function loadFont(fontName: string, fontUrl: string, querySelector: string = "html, body, *"): Promise<(() => void) | null> {
	const ext = fontUrl.split(".").pop()?.split("?").shift()?.toLowerCase();

	let fontFormat;
	switch (ext) {
		case "woff2":
			fontFormat = "woff2";
			break;
		case "woff":
			fontFormat = "woff";
			break;
		case "ttf":
			fontFormat = "truetype";
			break;
		case "otf":
			fontFormat = "opentype";
			break;
		case "eot":
			fontFormat = "embedded-opentype";
			break;
		case "svg":
			fontFormat = "svg";
			break;
		default:
			throw new Error(`Unsupported font format: ${ext}`);
	}
	const font = new FontFace(fontName, `url("${fontUrl}") format("${fontFormat}")`);

	try {
		const f: FontFace = await font.load();
		document.fonts.add(f);

		function init() {
			const style = document.createElement("style");
			style.textContent = `${querySelector} {font-family: "${fontName}", var(--base-font) !important;}`;
			style.id = `loadFont-${fontName}`;
			document.head.appendChild(style);
		}
		return init;
	} catch (e) {
		console.warn("font load err", e);
	}
	return null;
}
