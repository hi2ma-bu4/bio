type Toast = HTMLDivElement;

const toasts: Toast[] = [];

/**
 * トースト通知を表示する
 * @param message - 表示するメッセージ
 * @param duration - 表示時間（ミリ秒）
 * @param maxLineLength - 1行あたりの最大文字数
 */
export function showToast(message: string, duration: number = 3000, maxLineLength: number = 30): void {
	const toast: Toast = document.createElement("div");

	// 自動改行
	if (message.length > maxLineLength) {
		const regex = new RegExp(`(.{1,${maxLineLength}})`, "g");
		message = message.match(regex)?.join("\n") ?? message;
	}
	toast.textContent = message;

	// TailwindCSSクラスを追加
	toast.className = "fixed right-5 bg-black bg-opacity-80 text-white px-4 py-2 rounded shadow-md text-sm cursor-pointer opacity-0 transform translate-y-5 transition-all whitespace-pre-line z-50";

	document.body.appendChild(toast);
	toasts.push(toast);

	// アニメーションで表示
	requestAnimationFrame(() => {
		toast.classList.remove("translate-y-5", "opacity-0");
		toast.classList.add("translate-y-0", "opacity-100");
	});

	// クリックで削除
	toast.addEventListener("click", () => removeToast(toast));

	// 自動で消す
	setTimeout(() => removeToast(toast), duration);

	updateToastPositions();
}

/**
 * トースト通知を削除する
 * @param toast - 削除対象のトースト要素
 */
function removeToast(toast: Toast): void {
	if (!toast.parentNode) return;

	// アニメーションで消す
	toast.classList.add("translate-y-5", "opacity-0");
	toast.addEventListener(
		"transitionend",
		() => {
			if (toast.parentNode) toast.parentNode.removeChild(toast);
			const index = toasts.indexOf(toast);
			if (index > -1) toasts.splice(index, 1);
			updateToastPositions();
		},
		{ once: true },
	);
}

/**
 * 表示中の全てのトーストの位置を再計算する
 */
function updateToastPositions(): void {
	let offset = 20;
	toasts.forEach((toast) => {
		toast.style.bottom = offset + "px";
		offset += toast.offsetHeight + 10;
	});
}
