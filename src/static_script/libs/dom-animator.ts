/**!
 * @fileoverview DomAnimator.ts - Console-style animation in the DOM.
 * @license MIT
 * @author Tim Holman (Original JS)
 * @author hi2ma-bu4 (TypeScript/Partytown Conversion)
 * @see https://github.com/tholman/dom-animator
 */

interface DomAnimatorInstance {
	addFrame: (frameData: string | string[], time?: number) => void;
	animate: (time?: number) => void;
	stop: () => void;
}

/**
 * DomAnimator: DOM コメント ノードを使用してコンソール アート スタイルのフレームをアニメーション化します。
 */
export const DomAnimator: DomAnimatorInstance = ((): DomAnimatorInstance => {
	// --- State Variables ---
	let currentFrameIndex = 0;
	const frames: (string | string[])[] = [];
	const nodes: Comment[] = [];

	// マルチノード/マルチラインサポートのための機能検出
	const isMultiNodeMode = !!!(window as any).chrome;

	let interval: number | null = null;
	const defaultTime = 500; // ms
	let isAttached = false;
	const whiteSpaceString = "\u00A0"; // Non-breaking space

	// --- Utility Functions ---

	/**
	 * 表示の一貫性を保つために、標準スペースを非改行スペースと交換します。
	 * @param array フレームラインの配列。
	 */
	function swapWhitespace(array: string[]): string[] {
		return array.map((line) => line.replace(/ /g, whiteSpaceString));
	}

	/**
	 * 一貫した表示を行うために、単一の文字列フレームを改行で埋めます。
	 * @param str フレーム文字列。
	 */
	function padString(str: string): string {
		return `\n${str}\n`;
	}

	/**
	 * 複数行のフレームを解析します (string[] として渡されます)。
	 */
	function parseMultilineFrame(frame: string[]): string | string[] {
		if (isMultiNodeMode) {
			// マルチノードの場合は、スペースを入れ替えた行の配列が必要です。
			return swapWhitespace(frame);
		} else {
			// 単一ノードの場合、行を結合し、結果の文字列を埋め込みます。
			return padString(frame.join("\n"));
		}
	}

	/**
	 * 単一行または複数行の文字列フレームを解析します。
	 */
	function parseSingleLineFrame(frame: string): string | string[] {
		if (isMultiNodeMode) {
			// 改行で分割し、スペースを交換して配列を返します
			return swapWhitespace(frame.split("\n"));
		} else {
			// 文字列をパディングする
			return padString(frame);
		}
	}

	// --- Core Logic ---

	/**
	 * アニメーション用にコメント ノードをドキュメントにアタッチします。
	 */
	function attachToDocument(): void {
		if (isAttached) return;

		const head = document.head;
		const parent = head.parentNode;

		if (!parent) {
			console.error("Could not find parent node for document head.");
			return;
		}

		const initialFrame = frames[0];

		if (isMultiNodeMode) {
			if (Array.isArray(initialFrame)) {
				// フレーム配列の行ごとに 1 つのコメント ノードを作成します
				const totalNodes = initialFrame.length;
				for (let i = 0; i < totalNodes; i++) {
					const node = document.createComment("");
					nodes.push(node as Comment); // Partytown が DOM メソッドをプロキシとしてキャストする
					parent.insertBefore(node, head);
				}
			} else {
				console.error("Multi-node mode expects frame data to be an array of strings.");
			}
		} else {
			// Creates a single comment node
			const node = document.createComment("");
			nodes.push(node as Comment);
			parent.insertBefore(node, head);
		}

		isAttached = true;
	}

	/**
	 * 現在のフレームを DOM ノードにレンダリングします。
	 */
	function renderFrame(): void {
		// レンダリングを試行する前にノードがアタッチされていることを確認してください
		if (!isAttached) {
			attachToDocument();
			// それでも接続されていない場合 (親が見つからないなど)、ベイルアウトします。
			if (!isAttached) return;
		}

		const frameData = frames[currentFrameIndex];

		if (isMultiNodeMode) {
			// FrameData 配列の対応する行で各ノードを更新します。
			if (Array.isArray(frameData)) {
				nodes.forEach((node, i) => {
					if (frameData[i] !== undefined) {
						node.nodeValue = frameData[i];
					}
				});
			}
		} else {
			// 単一ノードを完全なフレーム文字列で更新します。
			if (typeof frameData === "string") {
				nodes[0].nodeValue = frameData;
			}
		}

		currentFrameIndex = (currentFrameIndex + 1) % frames.length;
	}

	// --- Public API ---

	/**
	 * シーケンスにアニメーション フレームを追加します。
	 * @param frameData 文字列 (単一行または複数行) または文字列配列 (複数行) としてのフレーム データ。
	 */
	function addFrame(frameData: string | string[]): void {
		if (Array.isArray(frameData)) {
			frames.push(parseMultilineFrame(frameData));
		} else if (typeof frameData === "string") {
			frames.push(parseSingleLineFrame(frameData));
		} else {
			console.warn("Invalid frame data type provided.");
		}
	}

	/**
	 * アニメーションシーケンスを開始します。
	 * @param time ミリ秒単位の間隔時間。指定しない場合はデフォルトを使用します。
	 */
	function animate(time?: number): void {
		const intervalTime = time ?? defaultTime;

		if (frames.length === 0) {
			console.warn("Cannot animate. Add frames using .addFrame( data ) first.");
			return;
		}

		if (interval !== null) {
			stop();
		}

		interval = setInterval(renderFrame, intervalTime) as unknown as number;
	}

	/**
	 * アニメーションを停止します。
	 */
	function stop(): void {
		if (interval !== null) {
			clearInterval(interval);
			interval = null;

			nodes.forEach((node) => node.remove());
			isAttached = false;
		}
	}

	// Tree-shaking の利点に必要なパブリック メソッドのみをエクスポートする
	return {
		addFrame,
		animate,
		stop,
	};
})();
