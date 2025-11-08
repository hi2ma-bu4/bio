import solidJs from "@astrojs/solid-js";
import tailwindVite from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import relativeLinks from "astro-relative-links";

export default defineConfig({
	site: undefined,
	base: "",
	build: {
		format: "file",
	},
	integrations: [solidJs(), relativeLinks()],
	vite: {
		plugins: [tailwindVite()],
	},
});
