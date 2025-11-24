import { registerSW } from "virtual:pwa-register";

const intervalMS = 60 * 60 * 1000;

const updateSW = registerSW({
	immediate: true,
	onRegisteredSW(swUrl, r) {
		console.log("SW registered: ", swUrl);
		if (r) {
			setInterval(async () => {
				if (r.installing || !navigator) return;
				if ("connection" in navigator && !navigator.onLine) return;
				const resp = await fetch(swUrl, {
					cache: "no-store",
					headers: {
						cache: "no-store",
						"cache-control": "no-cache",
					},
				});

				if (resp?.status === 200) await r.update();
			}, intervalMS);
		}
	},
	onNeedRefresh() {
		console.log("NeedRefresh");
	},
	onOfflineReady() {
		console.log("PWA application ready to work offline");
	},
});
