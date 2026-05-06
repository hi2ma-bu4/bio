/**
 * AdBlockDetectorOptions インターフェース
 */
export interface AdBlockDetectorOptions {
	/** ブロッカーの反応（DOMの変化）を待つミリ秒数 */
	timeout?: number;
	/** デバッグログをコンソールに出力するかどうか */
	debug?: boolean;
}

/**
 * 検出結果の内部ステータス
 */
interface DetectionResults {
	/** スタイルのブロック状態 */
	style?: boolean;
	/** 要素のブロック状態 */
	element?: boolean;
}

/**
 * AdBlockDetector
 * 広告ブロッカーを検知するクラス
 */
export class AdBlockDetector {
	/** オプション */
	private options: Required<AdBlockDetectorOptions>;
	/** 検出結果 */
	private results: DetectionResults = {};

	/**
	 * コンストラクタ
	 * @param options - オプション
	 */
	constructor(options: AdBlockDetectorOptions = {}) {
		this.options = {
			timeout: options.timeout ?? 200,
			debug: options.debug ?? false,
		};
	}

	/**
	 * 広告ブロッカーの検知を実行します
	 * @returns ブロッカーが検出された場合は true
	 */
	public async detect(): Promise<boolean> {
		const checks = [
			{ id: "style" as const, fn: this._checkStyle },
			{ id: "element" as const, fn: this._checkElement },
		];

		const tasks = checks.map((check) =>
			check.fn
				.call(this)
				.then((res) => (this.results[check.id] = res))
				.catch(() => (this.results[check.id] = false)),
		);

		await Promise.all(tasks);

		if (this.options.debug) {
			console.log("[AdBlockDetector] Analysis Result:");
			console.table(this.results);
		}

		// いずれかのチェックで真（ブロック）と判定されれば true
		return Object.values(this.results).some((res) => res === true);
	}

	/**
	 * CSSスタイルの整合性チェック
	 * @returns ブロックされている場合は true
	 */
	private async _checkStyle(): Promise<boolean> {
		const div = document.createElement("div");
		// 多くのフィルタに合致する一般的な広告用クラス名
		div.className = "pub_300x250 ad-slot banner-ad ads-area";
		// プログラム側からは !important で表示を強制する
		div.setAttribute("style", "display:block !important; position:absolute; left:-999px; width:10px; height:10px;");

		const container = document.body || document.documentElement;
		container.appendChild(div);

		// ブロッカーのCSS注入を待機
		await new Promise((resolve) => setTimeout(resolve, this.options.timeout));

		const style = window.getComputedStyle(div);
		// 強制したはずの display:block が上書きされているか確認
		const isBlocked = style.display === "none" || style.visibility === "hidden" || style.opacity === "0";

		div.remove();
		return isBlocked;
	}

	/**
	 * ダミー要素のレンダリングチェック
	 * @returns ブロックされている場合は true
	 */
	private async _checkElement(): Promise<boolean> {
		const ad = document.createElement("div");
		ad.className = "adsbox ad-unit google-ads";
		ad.innerHTML = "&nbsp;";
		ad.setAttribute("style", "position:absolute; left:-999px; width:10px; height:10px;");

		const container = document.body || document.documentElement;
		container.appendChild(ad);

		await new Promise((resolve) => setTimeout(resolve, this.options.timeout));

		// offsetHeightが0、またはDOMから切り離されている（isConnectedがfalse）かをチェック
		const isBlocked = ad.offsetHeight === 0 || !ad.isConnected;

		ad.remove();
		return isBlocked;
	}
}
