import { deviceType } from "detect-it";
import { isbot } from "isbot";

import { getQueryParams, paramToBoolean } from "../scripts/libs/query";
import { DomAnimator } from "./libs/dom-animator";

function slidingWindowsCircular(s: string, N: number, M: number): string[] {
	const len = ((N / 2) | 0) + 1;
	const pad = " ".repeat(len);
	const extended = pad + s + pad + s.slice(0, len); // 前後に空白、先頭を最後に追加
	const result: string[] = [];

	for (let i = 0, li = extended.length - N; i <= li; i += M) {
		result.push(extended.slice(i, i + N));
	}

	return result;
}

function transpose<T>(matrix: T[][]): T[][] {
	const rows = matrix.length;
	const cols = matrix[0].length;
	const result: T[][] = Array.from({ length: cols }, () => new Array(rows));

	for (let i = 0; i < rows; i++) {
		const row = matrix[i];
		for (let j = 0; j < cols; j++) {
			result[j][i] = row[j];
		}
	}

	return result;
}

// georgia11
const base = `                                                                          ,,
 .M"""bgd                                                      .M"""bgd   db    mm
,MI    "Y                                                     ,MI    "Y         MM
\`MMb.     \`7MMpMMMb.   ,pW"Wq.  \`7M'    ,A    \`MF',pP"Ybd     \`MMb.     \`7MM  mmMMmm   .gP"Ya
  \`YMMNq.   MM    MM  6W'   \`Wb   VA   ,VAA   ,V  8I   \`"       \`YMMNq.   MM    MM    ,M'   Yb
.     \`MM   MM    MM  8M     M8    VA ,V  VA ,V   \`YMMMa.     .     \`MM   MM    MM    8M""""""
Mb     dM   MM    MM  YA.   ,A9     VVV    VVV    L.   I8     Mb     dM   MM    MM    YM.    ,
P"Ybmmd"  .JMML  JMML. \`Ybmd9'       W      W     M9mmmP'     P"Ybmmd"  .JMML.  \`Mbmo  \`Mbmmd'`;

const maxChar = 40;
const rowArr = base.split("\n");
const maxRowLength = Math.max(...rowArr.map((s) => s.length));
const frameData = transpose(
	rowArr.map((s) =>
		//
		slidingWindowsCircular(s.padEnd(maxRowLength, " "), maxChar, 5),
	),
);
frameData.forEach((f) => DomAnimator.addFrame(f));

let timerId: NodeJS.Timeout;
function init() {
	if (timerId) {
		stop();
	}

	const params = getQueryParams(["egg"]);
	if (params.egg && !paramToBoolean(params.egg)) {
		return;
	}

	DomAnimator.animate(500);
	timerId = setTimeout(
		stop,
		1000 * 60 * 5, // 5分後に停止
	);
}

function stop() {
	clearTimeout(timerId);
	DomAnimator.stop();
}

// クローラー以外の場合のみ動作
if (!isbot(navigator.userAgent) && deviceType !== "touchOnly") {
	init();
	document.addEventListener("astro:before-preparation", stop);
}
