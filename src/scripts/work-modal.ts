// 作品モーダルの制御（共通ユーティリティを使用）
import { addEscapeListener, createFocusTrap, lockBodyScroll, unlockBodyScroll } from "./ui-utils";

function initWorkModal() {
	const modal = document.getElementById("work-modal") as HTMLDialogElement | null;
	const closeButton = document.getElementById("modal-close-button");
	const modalContent = document.getElementById("modal-content");
	const triggers = document.querySelectorAll(".work-modal-trigger");
	const template = document.getElementById("work-modal-template") as HTMLTemplateElement | null;

	if (!modal) return;
	if (!closeButton || !modalContent || !template || !window.WORK_ITEMS) {
		console.warn("Modal elements, template, or WORK_ITEMS not found.");
		return;
	}

	const workItems = window.WORK_ITEMS;
	let lastFocusedElement: HTMLElement | null = null;
	let focusTrap: ReturnType<typeof createFocusTrap> | null = null;
	let removeEscape: (() => void) | null = null;

	// モーダルを開く
	triggers.forEach((trigger) => {
		trigger.addEventListener("click", async (e) => {
			e.preventDefault();
			const workId = (trigger as HTMLElement).dataset.workId;
			if (!workId) return;

			const workData = workItems[workId];
			if (workData && modal) {
				// コンテンツの動的挿入
				const content = template.content.cloneNode(true) as DocumentFragment;

				const titleEl = content.querySelector('[data-template-id="title"]');
				if (titleEl) titleEl.textContent = workData.title;

				const imageEl = content.querySelector('[data-template-id="image"]') as HTMLImageElement | null;
				if (imageEl) {
					const absoluteImageUrl = new URL(workData.imageUrl, window.location.origin).href;
					imageEl.src = absoluteImageUrl;
					imageEl.alt = workData.title;
				}

				const longDescriptionEl = content.querySelector('[data-template-id="long-description"]');
				if (longDescriptionEl) longDescriptionEl.textContent = workData.longDescription;

				const tagsEl = content.querySelector('[data-template-id="tags"]');
				if (tagsEl) {
					tagsEl.innerHTML = ""; // Clear existing tags
					workData.tags.forEach((tag: string) => {
						const tagSpan = document.createElement("span");
						tagSpan.className = "text-xs font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200";
						tagSpan.textContent = tag;
						tagsEl.appendChild(tagSpan);
					});
				}

				const directLinkEl = content.querySelector('[data-template-id="direct-link"]') as HTMLAnchorElement | null;
				if (directLinkEl) {
					if (workData.directLink) {
						directLinkEl.href = workData.directLink;
						directLinkEl.classList.remove("hidden");
						directLinkEl.classList.add("inline-flex");
					} else {
						directLinkEl.classList.add("hidden");
						directLinkEl.classList.remove("inline-flex");
					}
				}

				// 既存のコンテンツをクリアして新しいコンテンツを挿入
				modalContent.innerHTML = "";
				modalContent.appendChild(content);

				lastFocusedElement = document.activeElement as HTMLElement;
				modal.showModal();

				// スクロールロックとフォーカストラップを有効化
				lockBodyScroll();
				focusTrap = createFocusTrap(modal);
				focusTrap.activate();
				focusTrap.focusFirst();
				if (!removeEscape) removeEscape = addEscapeListener(() => modal.close());
			}
		});
	});

	modal.addEventListener("close", () => {
		if (focusTrap) {
			focusTrap.deactivate();
			focusTrap = null;
		}
		if (removeEscape) {
			removeEscape();
			removeEscape = null;
		}
		unlockBodyScroll();
		lastFocusedElement?.focus();
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

// DOMの読み込み完了を待ってから実行
document.addEventListener("astro:after-swap", initWorkModal);
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initWorkModal);
} else {
	initWorkModal();
}
