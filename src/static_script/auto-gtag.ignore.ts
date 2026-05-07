/* =========================================
 * グローバル型拡張
 * ========================================= */

interface DataLayerEvent {
	event: string;
	[key: string]: unknown;
}

declare global {
	interface Window {
		dataLayer: DataLayerEvent[];
	}
}

/* 外部モジュール化（必須） */
export {};

/* =========================================
 * 実装本体
 * ========================================= */

((): void => {
	/* =========================
	 * 設定
	 * ========================= */
	const DOWNLOAD_EXT = /\.(zip|pdf|ttf|otf|woff2?|png|jpe?g|gif|svg|web[pm])$/i;

	/* =========================
	 * dataLayer 初期化
	 * ========================= */
	window.dataLayer = window.dataLayer || [];

	function pushEvent(event: string, data: Record<string, unknown> = {}): void {
		window.dataLayer.push({
			event,
			...data,
		});
	}

	/* =========================
	 * GTM 初期化
	 * ========================= */
	function loadGTM(id: string): void {
		window.dataLayer.push({
			"gtm.start": Date.now(),
			event: "gtm.js",
		});

		const script = document.createElement("script");

		script.async = true;
		script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;

		document.head.appendChild(script);
	}

	loadGTM(import.meta.env.GTM_ID);

	/* =========================
	 * ページ情報
	 * ========================= */
	const path = location.pathname;

	/* =========================
	 * Utility
	 * ========================= */
	function getElementLabel(el: HTMLElement): string {
		return el.getAttribute("aria-label") || el.getAttribute("data-label") || el.id || el.getAttribute("name") || el.textContent?.trim().slice(0, 50) || el.tagName;
	}

	function isOutbound(url: string): boolean {
		try {
			return new URL(url, location.href).origin !== location.origin;
		} catch {
			return false;
		}
	}

	/* =========================
	 * Click / Link / Download
	 * ========================= */
	document.addEventListener("click", (event: MouseEvent): void => {
		const target = event.target as HTMLElement | null;

		if (!target) return;

		const el = target.closest("a,button") as HTMLAnchorElement | HTMLButtonElement | null;

		if (!el || !el.hasAttribute("data-track")) return;

		const label = getElementLabel(el);
		const href = el instanceof HTMLAnchorElement ? el.href : null;

		pushEvent("select_content", {
			event_label: label,
		});

		if (!href) return;

		const url = new URL(href);
		const ext = url.pathname.split(".").pop();

		if (isOutbound(href)) {
			pushEvent("outbound_click", {
				event_label: href,
				transport_type: "beacon",
			});
		}

		if (ext && DOWNLOAD_EXT.test(`.${ext}`)) {
			pushEvent("file_download", {
				file_url: href,
				file_ext: ext,
			});
		}
	});

	/* =========================
	 * Form submit
	 * ========================= */
	document.addEventListener("submit", (event: Event): void => {
		const form = event.target;

		if (!(form instanceof HTMLFormElement)) return;

		pushEvent("form_submit", {
			form_action: form.action || path,
			form_id: form.id || null,
			form_name: form.name || null,
		});
	});
})();
