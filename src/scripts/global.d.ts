export {}; // ←これでモジュール化

// グローバルスコープから作品データを取得 (works.astroで設定)
declare global {
	interface Window {
		WORK_ITEMS: Record<string, any>;
	}
}
