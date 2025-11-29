import { BASE_DIR, CLASS_AUTO_IMG_ALT } from "../config";

const ErrorImageUrl = `${BASE_DIR}no-image.svg`;
const isCheckClassName = "bio-imgCheck";
const isLoadClassName = "bio-imgLoad";
const isErrClassName = "bio-imgLoadErr";
const imgWrapperClassName = "img-wrapper";
const altButtonClassName = "alt-button";
const altPopupClassName = "alt-popup";

let imgIndex = 0;

/**
 * Wraps an image with a button to show its alt text.
 * @param img The image element to wrap.
 */
function wrapWithAltButton(img: HTMLImageElement): void {
	const id = `uid-img-${imgIndex}`;
	imgIndex++;

	// Create a wrapper element
	const wrapper = document.createElement("div");
	wrapper.className = imgWrapperClassName;

	// Replace the image with the wrapper and append the image to the wrapper
	img.parentNode?.insertBefore(wrapper, img);
	wrapper.appendChild(img);
	img.setAttribute("aria-labelledby", id);

	// Add the alt button
	const button = document.createElement("input");
	button.type = "button";
	button.className = altButtonClassName;
	button.value = "alt";
	wrapper.appendChild(button);

	const altText = img.alt;
	button.addEventListener("click", () => {
		const oldPopup = wrapper.querySelector<HTMLDivElement>(`.${altPopupClassName}`);
		if (oldPopup) {
			oldPopup.remove();
			return;
		}
		const popup = document.createElement("div");
		popup.className = altPopupClassName;
		popup.innerText = altText;
		popup.id = id;

		wrapper.appendChild(popup);
	});
}

/**
 * Handles successful image loads.
 * @param target The image element that loaded.
 */
function handleLoad(target: HTMLImageElement): void {
	if (target.classList.contains(isLoadClassName) || target.classList.contains(isErrClassName)) return;
	target.classList.add(isLoadClassName);
}

/**
 * Handles image loading errors.
 * @param target The image element that failed to load.
 */
function handleError(target: HTMLImageElement): void {
	// Prevent infinite loops
	if (target.classList.contains(isErrClassName)) return;

	target.classList.add(isErrClassName);
	console.warn(`image load error: `, target.src);

	// Update alt text to include original source for context
	target.alt = `${target.alt ?? "説明なし"}(${target.src})`;
	target.src = ErrorImageUrl;

	if (target.classList.contains(CLASS_AUTO_IMG_ALT)) {
		wrapWithAltButton(target);
	}
}

// Use event delegation on the document to catch all load/error events
document.addEventListener(
	"load",
	(e) => {
		if (e.target instanceof HTMLImageElement) {
			handleLoad(e.target);
		}
	},
	true
); // Use capture phase

document.addEventListener(
	"error",
	(e) => {
		if (e.target instanceof HTMLImageElement) {
			handleError(e.target);
		}
	},
	true
); // Use capture phase

/**
 * Applies the 'checking' class to an image if it hasn't been processed yet.
 * Also handles cached images.
 * @param img The image element to process.
 */
function processImage(img: HTMLImageElement): void {
	if (img.classList.contains(isCheckClassName) || img.classList.contains(isLoadClassName) || img.classList.contains(isErrClassName)) {
		return;
	}
	img.classList.add(isCheckClassName);

	// For cached images, the 'load' or 'error' event might have already fired.
	// We need to check the `complete` property.
	if (img.complete) {
		if (img.naturalWidth === 0) {
			// This is likely an error
			handleError(img);
		} else {
			// This is likely a successful load
			handleLoad(img);
		}
	}
}

/**
 * Finds and processes all images within a given NodeList.
 * @param nodes A list of nodes to search for images.
 */
function checkNodesForImages(nodes: NodeList): void {
	for (const node of nodes) {
		if (node.nodeType === Node.ELEMENT_NODE) {
			const el = node as Element;
			// If the node itself is an image
			if (el.tagName === "IMG") {
				processImage(el as HTMLImageElement);
			}
			// Check for images within the node
			const imgs = el.querySelectorAll<HTMLImageElement>("img");
			imgs.forEach(processImage);
		}
	}
}

/**
 * Initializes the image processing and sets up the MutationObserver.
 */
function initImageHandler(): void {
	// Initial check for all images on the page
	document.querySelectorAll<HTMLImageElement>("img").forEach(processImage);

	// Use MutationObserver to detect dynamically added images
	const observer = new MutationObserver((mutationsList) => {
		for (const mutation of mutationsList) {
			if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
				checkNodesForImages(mutation.addedNodes);
			}
		}
	});

	// Start observing the document body for changes
	observer.observe(document.body, { childList: true, subtree: true });
}

// Run the initialization
initImageHandler();

// Re-run checks after Astro's view transitions
document.addEventListener("astro:after-swap", () => {
	initImageHandler();
});
