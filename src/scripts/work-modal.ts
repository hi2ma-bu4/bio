// 作品モーダルの制御

function initWorkModal() {
	const modal = document.getElementById("work-modal") as HTMLDialogElement | null;
	const closeButton = document.getElementById("modal-close-button");
	const modalContent = document.getElementById("modal-content");
	const triggers = document.querySelectorAll(".work-modal-trigger");

	if (!modal || !closeButton || !modalContent || !window.WORK_ITEMS) {
		console.warn("Modal elements or WORK_ITEMS not found.");
		return;
	}

	const workItems = window.WORK_ITEMS;

	// モーダルを開く
	triggers.forEach((trigger) => {
		trigger.addEventListener("click", async (e) => {
			e.preventDefault();
			const workId = (trigger as HTMLElement).dataset.workId;

			if (!workId) return;

			const workData = workItems[workId];

			if (workData && modal) {
				// コンテンツの動的挿入 (バグ修正: XSS対策のため、innerHTMLの使用は最小限に)
				// ここでは前回同様innerHTMLを使いますが、堅牢な実装ではサニタイズが必要です
				modalContent.innerHTML = `
          <h2 class="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-white">${escapeHTML(workData.title)}</h2>
          <img src="${escapeHTML(workData.imageUrl)}" alt="${escapeHTML(workData.title)}" class="w-full aspect-video object-cover rounded-md mb-6" onerror="this.onerror=null; this.src='/no-image.svg';">
          <p class="text-slate-700 dark:text-slate-300 mb-6">${escapeHTML(workData.longDescription)}</p>
          <div class="flex flex-wrap gap-2 mb-6">
            ${workData.tags.map((tag: string) => `<span class="text-xs font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200">${escapeHTML(tag)}</span>`).join("")}
          </div>
          ${
				workData.directLink
					? `<a href="${escapeHTML(workData.directLink)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2 rounded-md text-base font-medium bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-500">
              サイトへ移動
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17H4.25A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M6.19 14.25a.75.75 0 0 1 .04-1.06l4.1-4.1V6.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1 0-1.5h2.34l-4.1 4.1a.75.75 0 0 1-1.06-.04Z" clip-rule="evenodd" /></svg>
            </a>`
					: ""
			}
        `;

				modal.showModal();
				closeButton.focus();
			}
		});
	});

	// 閉じるボタン
	closeButton.addEventListener("click", () => {
		modal.close();
	});

	// backdropクリックで閉じる
	modal.addEventListener("click", (e) => {
		if (e.target === modal) {
			modal.close();
		}
	});
}

// 簡易的なHTMLエスケープ関数 (改善点)
function escapeHTML(str: string) {
	return str.replace(/[&<>"']/g, function (match) {
		return (
			{
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			}[match] || match
		);
	});
}

// DOMの読み込み完了を待ってから実行
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initWorkModal);
} else {
	initWorkModal();
}
