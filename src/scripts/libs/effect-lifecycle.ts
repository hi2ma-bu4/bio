export interface EffectLifecycle {
	addStop(fn: () => void): void;
	addUpdate(fn: () => void): void;
	stop(): void;
	update(): void;
}

/**
 * エフェクトのライフサイクル管理オブジェクトを作成する
 * @returns ライフサイクル管理オブジェクト
 */
export function createEffectLifecycle(): EffectLifecycle {
	const stopCallbacks = new Set<() => void>();
	const updateCallbacks = new Set<() => void>();

	return {
		addStop(fn) {
			stopCallbacks.add(fn);
		},
		addUpdate(fn) {
			updateCallbacks.add(fn);
		},
		stop() {
			for (const fn of stopCallbacks) {
				fn();
			}
		},
		update() {
			for (const fn of updateCallbacks) {
				fn();
			}
		},
	};
}
