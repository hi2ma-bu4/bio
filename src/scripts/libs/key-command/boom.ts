import { addStyle } from "../ui-utils";
import boomStyles from "./boom.css?inline";

/**
 * 要素の計算済みスタイルを別の要素にコピーする
 * @param src - コピー元の要素
 * @param target - コピー先の要素
 */
function copyComputedStyle(src: Element, target: HTMLElement) {
	const computed = getComputedStyle(src);
	for (let prop of computed) {
		target.style.setProperty(prop, computed.getPropertyValue(prop));
	}
}

/**
 * 爆発エフェクトのパーティクルを作成する
 * @param x - 生成位置 X
 * @param y - 生成位置 Y
 * @param color - パーティクルの色
 */
function createParticle(x: number, y: number, color: string) {
	const p = document.createElement("div");
	p.className = "bomb-particle";
	p.style.left = x + "px";
	p.style.top = y + "px";
	p.style.background = color;
	document.body.appendChild(p);

	const dx = (Math.random() - 0.5) * 200;
	const dy = (Math.random() - 0.5) * 200;
	requestAnimationFrame(() => {
		p.style.transform = `translate(${dx}px, ${dy}px)`;
		p.style.opacity = "0";
	});

	setTimeout(() => p.remove(), 800);
}

/**
 * 要素をクリックした際に爆発させるイベントハンドラ
 * @param e - ポインターイベント
 */
export function domOnBomb(e: PointerEvent) {
	addStyle(boomStyles, "boom-style");

	const el = e.target as HTMLElement | null;
	if (!el || el.tagName === "BODY") return; // body除外
	if (getComputedStyle(el).opacity === "0") return; // 透過除外

	const rect = el.getBoundingClientRect();
	const origOpacity = getComputedStyle(el).opacity;

	// 元要素を透明化
	el.style.opacity = "0";

	// クローン作成
	const clone = el.cloneNode(true) as HTMLElement;
	clone.className += " bomb-clone";
	copyComputedStyle(el, clone);

	clone.style.left = rect.left + "px";
	clone.style.top = rect.top + "px";
	clone.style.width = rect.width + "px";
	clone.style.height = rect.height + "px";

	document.body.appendChild(clone);

	// 爆発アニメーション種類
	const type = Math.floor(Math.random() * 4);
	let x = 0,
		y = 0,
		r = 0,
		scale = 1;

	switch (type) {
		case 0: // 直線
			x = (Math.random() - 0.5) * 500;
			y = (Math.random() - 0.5) * 500;
			r = (Math.random() - 0.5) * 720;
			break;
		case 1: // 弾む
			x = (Math.random() - 0.5) * 300;
			y = -200 + Math.random() * 100;
			r = (Math.random() - 0.5) * 1080;
			break;
		case 2: // 拡散
			x = (Math.random() - 0.5) * 400;
			y = (Math.random() - 0.5) * 400;
			scale = 1.5;
			r = (Math.random() - 0.5) * 720;
			break;
		case 3: // ねじれ
			x = (Math.random() - 0.5) * 400;
			y = (Math.random() - 0.5) * 400;
			r = (Math.random() - 0.5) * 1440;
			break;
	}

	clone.style.transition = "transform 1s ease-out, opacity 1s ease-out";
	clone.style.transform = `translate(0px,0px) rotate(0deg) scale(1)`;
	clone.style.opacity = "1";

	requestAnimationFrame(() => {
		clone.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${scale})`;
		clone.style.opacity = "0";
	});

	// パーティクル発生
	const colors = ["#ff69b4", "#ffd700", "#00ffff", "#ff4500", "#adff2f"];
	for (let i = 0; i < 20; i++) {
		const px = rect.left + rect.width / 2;
		const py = rect.top + rect.height / 2;
		createParticle(px, py, colors[Math.floor(Math.random() * colors.length)]);
	}

	// 逆回しで戻す
	setTimeout(() => {
		clone.style.transition = "transform 1s ease-in, opacity 1s ease-in";
		clone.style.transform = "translate(0px,0px) rotate(0deg) scale(1)";
		clone.style.opacity = "1";

		// 完了後削除＆元要素復帰
		setTimeout(() => {
			clone.remove();
			el.style.opacity = origOpacity;
		}, 1200);
	}, 1200);
}
