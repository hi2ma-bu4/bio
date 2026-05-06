import { addStyle, removeStyle } from "../ui-utils";
import mirrorStyles from "./mirror.css?inline";

export class MirrorMode {
	private mirrorMode: boolean = false;

	constructor() {
		this.init();
	}

	/** 初期化・イベント登録・CSS作成 */
	public init(): void {
		addStyle(mirrorStyles, "mirror-style");
	}

	/** モード切替 */
	public toggle(): void {
		this.mirrorMode = !this.mirrorMode;
		document.body.classList.toggle("mirror-mode", this.mirrorMode);
	}

	/** destroy: CSS削除 */
	public destroy(): void {
		removeStyle("mirror-style");
		document.body.classList.remove("mirror-mode");
		this.mirrorMode = false;
	}
}
