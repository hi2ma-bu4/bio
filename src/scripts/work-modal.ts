// 作品モーダルの制御（共通ユーティリティを使用）
import { OverlayScrollbars } from "overlayscrollbars";

import type { worksDataType } from "../pages/works.astro";
import { addEscapeListener, createFocusTrap, lockBodyScroll, unlockBodyScroll } from "./libs/ui-utils";

function initWorkModal() {
	const modal = document.getElementById("work-modal") as HTMLDialogElement | null;
	const modalWrapper = document.getElementById("work-modal-wrapper") as HTMLDivElement | null;
	const closeButton = document.getElementById("modal-close-button") as HTMLButtonElement | null;
	const modalContent = document.getElementById("modal-content") as HTMLDivElement | null;
	const triggers = document.querySelectorAll<HTMLButtonElement>(".work-modal-trigger");
	const template = document.getElementById("work-modal-template") as HTMLTemplateElement | null;

	if (!modal || !modalWrapper) return;
	if (!closeButton || !modalContent || !template || !window.WORK_ITEMS) {
		console.warn("Modal elements, template, or WORK_ITEMS not found.");
		return;
	}

	OverlayScrollbars(modalWrapper, {
		showNativeOverlaidScrollbars: true,
		scrollbars: {
			theme: "os-theme-bio",
			clickScroll: true,
		},
	});

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

			const workData: worksDataType = workItems[workId];
			if (workData && modal) {
				// コンテンツの動的挿入
				const content = template.content.cloneNode(true) as DocumentFragment;

				const titleEl = content.querySelector<HTMLHeadingElement>('[data-template-id="title"]');
				if (titleEl) titleEl.textContent = workData.title;

				const imageEl = content.querySelector<HTMLImageElement>('[data-template-id="image"]') as HTMLImageElement | null;
				if (imageEl) {
					const absoluteImageUrl = new URL(workData.imageUrl, window.location.origin).href;
					imageEl.src = absoluteImageUrl;
					imageEl.alt = workData.title;
				}

				const longDescriptionEl = content.querySelector<HTMLParagraphElement>('[data-template-id="long-description"]');
				if (longDescriptionEl) longDescriptionEl.innerText = workData.longDescription;

				const othUrlsEl = content.querySelector<HTMLParagraphElement>('[data-template-id="oth-urls"]');
				if (othUrlsEl) {
					othUrlsEl.innerHTML = "";
					if (workData.othUrls) {
						workData.othUrls.forEach((link: string) => {
							const urlLi = document.createElement("li");
							urlLi.className = "mb-2 list-none";
							const urlAnchor = document.createElement("a");
							urlAnchor.className = "text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 underline break-all";
							urlAnchor.href = link;
							urlAnchor.textContent = urlAnchor.href;
							urlLi.appendChild(urlAnchor);
							othUrlsEl.appendChild(urlLi);
						});
					}
				}

				const tagsEl = content.querySelector<HTMLDivElement>('[data-template-id="tags"]');
				if (tagsEl) {
					tagsEl.innerHTML = ""; // Clear existing tags
					workData.tags.forEach((tag: string) => {
						const tagSpan = document.createElement("span");
						tagSpan.className = "text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200";
						tagSpan.textContent = tag;
						tagsEl.appendChild(tagSpan);
					});
				}

				const directLinkEl = content.querySelector<HTMLAnchorElement>('[data-template-id="direct-link"]');
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

				const githubLinkEl = content.querySelector<HTMLAnchorElement>('[data-template-id="github-link"]');
				if (githubLinkEl) {
					if (workData.githubLink) {
						githubLinkEl.href = workData.githubLink;
						githubLinkEl.classList.remove("hidden");
						githubLinkEl.classList.add("inline-flex");
					} else {
						githubLinkEl.classList.add("hidden");
						githubLinkEl.classList.remove("inline-flex");
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

				modal.scroll({
					top: 0,
					behavior: "instant",
				});
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
