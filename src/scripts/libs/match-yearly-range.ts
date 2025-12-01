type YearlyRange<T extends string> = {
	id: T; // switch用の識別子
	start: { month: number; day: number };
	end: { month: number; day: number };
};

export function matchYearlyRange<T extends string>(target: Date, ranges: readonly YearlyRange<T>[]): T | null {
	const md = (target.getMonth() + 1) * 100 + target.getDate();

	for (let i = 0; i < ranges.length; i++) {
		const r = ranges[i];
		const start = r.start.month * 100 + r.start.day;
		const end = r.end.month * 100 + r.end.day;

		// 普通の範囲（例：0701〜0831）
		if (start <= end) {
			if (md >= start && md <= end) return r.id;
		} else {
			// 年跨ぎ（例：1220〜0105）
			if (md >= start || md <= end) return r.id;
		}
	}

	return null;
}

const yearlyRanges = [
	{
		id: "valentine",
		start: { month: 2, day: 13 },
		end: { month: 2, day: 15 },
	},
	{
		id: "sakura",
		start: { month: 3, day: 21 },
		end: { month: 4, day: 10 },
	},
	{
		id: "fireworks",
		start: { month: 7, day: 21 },
		end: { month: 8, day: 31 },
	},
	{
		id: "halloween", // 未使用
		start: { month: 10, day: 28 },
		end: { month: 10, day: 31 },
	},
	{
		id: "autumn-leaves",
		start: { month: 11, day: 10 },
		end: { month: 11, day: 30 },
	},
	{
		id: "christmas",
		start: { month: 12, day: 10 },
		end: { month: 12, day: 25 },
	},
] as const satisfies readonly YearlyRange<string>[];

export type seasonEventId = (typeof yearlyRanges)[number]["id"];

export const nowYearlyEvent = matchYearlyRange(new Date(), yearlyRanges);
