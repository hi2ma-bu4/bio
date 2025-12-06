export type LogPart = {
	text: string;
	style?: string;
	mode?: "default" | "rainbow" | "gradient";
	gradientFrom?: string; // gradientモード用
	gradientTo?: string; // gradientモード用
};

function hsvToRgb(h: number, s: number, v: number) {
	const c = v * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = v - c;
	let r = 0,
		g = 0,
		b = 0;

	if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
	else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
	else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
	else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
	else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
	else [r, g, b] = [c, 0, x];

	return `rgb(${Math.round((r + m) * 255)},${Math.round((g + m) * 255)},${Math.round((b + m) * 255)})`;
}

function lerpColor(a: string, b: string, t: number) {
	const ah = parseInt(a.replace("#", ""), 16);
	const bh = parseInt(b.replace("#", ""), 16);

	const ar = (ah >> 16) & 0xff;
	const ag = (ah >> 8) & 0xff;
	const ab = ah & 0xff;

	const br = (bh >> 16) & 0xff;
	const bg = (bh >> 8) & 0xff;
	const bb = bh & 0xff;

	const rr = Math.round(ar + (br - ar) * t);
	const rg = Math.round(ag + (bg - ag) * t);
	const rb = Math.round(ab + (bb - ab) * t);

	return `rgb(${rr},${rg},${rb})`;
}

/**
 * ログをカラフルに出力
 * @param logParts - ログ出力用の文字列(スタイル別)
 */
export function styledLog(logParts: LogPart[]) {
	const logString: string[] = [];
	const logStyles: string[] = [];

	for (const part of logParts) {
		const chars = Array.from(part.text);
		if (part.mode === "rainbow") {
			for (let i = 0; i < chars.length; i++) {
				const hue = (i / chars.length) * 360; // 0〜360度で色相
				const color = hsvToRgb(hue, 1, 0.8); // 彩度100%, 明度100%
				logString.push(`%c${chars[i]}`);
				logStyles.push(`${part.style || ""}; color: ${color};`);
			}
		} else if (part.mode === "gradient" && part.gradientFrom && part.gradientTo) {
			for (let i = 0; i < chars.length; i++) {
				const t = i / Math.max(chars.length - 1, 1); // 0〜1
				const color = lerpColor(part.gradientFrom, part.gradientTo, t);
				logString.push(`%c${chars[i]}`);
				logStyles.push(`${part.style || ""}; color: ${color};`);
			}
		} else {
			// default
			logString.push(`%c${part.text}`);
			logStyles.push(part.style || "");
		}
	}

	console.log(logString.join(""), ...logStyles);
}
