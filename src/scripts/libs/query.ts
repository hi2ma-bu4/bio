export function getQueryParams<T extends string = string>(keys?: T[]): Record<T, string | string[]> {
	const params = new URLSearchParams(window.location.search);
	const result = {} as Record<T, string | string[]>;

	if (keys && keys.length > 0) {
		// 指定されたキーだけ取得
		keys.forEach((key) => {
			const values = params.getAll(key);
			result[key] = values.length > 1 ? values : (values[0] ?? "");
		});
	} else {
		// 全部取得
		params.forEach((value, key) => {
			const values = params.getAll(key);
			result[key as T] = values.length > 1 ? values : value;
		});
	}

	return result;
}

export function paramToBoolean(param: string | string[]): boolean {
	if (!param) return false;
	if (!Array.isArray(param)) {
		switch (param.toLowerCase()) {
			case "false":
			case "0":
			case "off":
				return false;
		}
	}
	return true;
}
