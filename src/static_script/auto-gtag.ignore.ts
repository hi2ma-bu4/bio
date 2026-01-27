/* =========================================
 * グローバル型拡張
 * ========================================= */

type GtagCommand = ["js", Date] | ["config", string, Record<string, unknown>?] | ["event", string, Record<string, unknown>?];

interface Gtag {
	(...args: GtagCommand): void;
}

declare global {
	interface Window {
		dataLayer: GtagCommand[];
		gtag: Gtag;
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
	 * gtag 初期化
	 * ========================= */
	window.dataLayer = window.dataLayer || [];

	const gtag: Gtag = (...args) => {
		window.dataLayer.push(args);
	};

	window.gtag = gtag;
	gtag("js", new Date());

	function loadGtag(id: string): void {
		const script = document.createElement("script");
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
		document.head.appendChild(script);
	}

	/* =========================
	 * ページ情報
	 * ========================= */
	const path = location.pathname;

	gtag("config", import.meta.env.GTAG_ID);
	gtag("config", import.meta.env.GA4_TAG);

	loadGtag(import.meta.env.GTAG_ID);

	/* =========================
	 * Utility
	 * ========================= */
	function getElementLabel(el: HTMLElement): string {
		return (
			el.getAttribute("aria-label") || //
			el.getAttribute("data-label") ||
			el.id ||
			el.getAttribute("name") ||
			el.textContent?.trim().slice(0, 50) ||
			el.tagName
		);
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

		gtag("event", "select_content", {
			event_label: label,
		});

		if (!href) return;

		const url = new URL(href);
		const ext = url.pathname.split(".").pop();

		if (isOutbound(href)) {
			gtag("event", "outbound_click", {
				event_label: href,
				transport_type: "beacon",
			});
		}

		if (ext && DOWNLOAD_EXT.test(`.${ext}`)) {
			gtag("event", "file_download", {
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

		gtag("event", "form_submit", {
			form_action: form.action || path,
			form_id: form.id || null,
			form_name: form.name || null,
		});
	});
})();
