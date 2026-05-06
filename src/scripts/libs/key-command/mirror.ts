import mirrorStyles from "./mirror.css?inline";

export class MirrorMode {
	private mirrorMode: boolean = false;
	private style: HTMLStyleElement | null = null;

	constructor() {
		this.init();
	}

	/** 初期化・イベント登録・CSS作成 */
	public init(): void {
		if (!this.style) {
			this.style = document.createElement("style");
			this.style.id = "mirror-style";
			this.style.textContent = mirrorStyles;
			document.head.appendChild(this.style);
		}
	}

	/** モード切替 */
	public toggle(): void {
		this.mirrorMode = !this.mirrorMode;
		document.body.classList.toggle("mirror-mode", this.mirrorMode);
	}

	/** destroy: CSS削除 */
	public destroy(): void {
		if (this.style?.parentNode) {
			this.style.parentNode.removeChild(this.style);
			this.style = null;
		}
		document.body.classList.remove("mirror-mode");
		this.mirrorMode = false;
	}
}
