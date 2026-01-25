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
		start: { month: 2, day: 14 },
		end: { month: 2, day: 14 },
	},
	{
		id: "white-day",
		start: { month: 3, day: 14 },
		end: { month: 3, day: 14 },
	},
	{
		id: "sakura",
		start: { month: 3, day: 21 },
		end: { month: 3, day: 31 },
	},
	{
		id: "april-fool",
		start: { month: 4, day: 1 },
		end: { month: 4, day: 1 },
	},
	{
		id: "sakura",
		start: { month: 4, day: 2 },
		end: { month: 4, day: 10 },
	},
	{
		id: "golden-week",
		start: { month: 4, day: 29 },
		end: { month: 5, day: 6 },
	},
	{
		id: "tetris",
		start: { month: 6, day: 6 },
		end: { month: 6, day: 6 },
	},
	{
		id: "rainy-season",
		start: { month: 6, day: 11 },
		end: { month: 7, day: 1 },
	},
	{
		id: "world-ufo-day",
		start: { month: 7, day: 2 },
		end: { month: 7, day: 2 },
	},
	{
		id: "rainy-season",
		start: { month: 7, day: 3 },
		end: { month: 7, day: 6 },
	},
	{
		id: "star-festival",
		start: { month: 7, day: 7 },
		end: { month: 7, day: 7 },
	},
	{
		id: "fireworks",
		start: { month: 7, day: 21 },
		end: { month: 8, day: 14 },
	},
	{
		id: "harvest-moon",
		start: { month: 8, day: 15 },
		end: { month: 8, day: 15 },
	},
	{
		id: "fireworks",
		start: { month: 8, day: 16 },
		end: { month: 8, day: 31 },
	},
	{
		id: "programmers-day",
		start: { month: 9, day: 12 },
		end: { month: 9, day: 13 },
	},
	{
		id: "halloween",
		start: { month: 10, day: 31 },
		end: { month: 10, day: 31 },
	},
	{
		id: "autumn-leaves",
		start: { month: 11, day: 10 },
		end: { month: 11, day: 22 },
	},
	{
		id: "labor-thanksgiving",
		start: { month: 11, day: 23 },
		end: { month: 11, day: 23 },
	},
	{
		id: "autumn-leaves",
		start: { month: 11, day: 24 },
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
