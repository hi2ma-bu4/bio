import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./src/**/*.{astro,js,ts}"],
	theme: {
		extend: {},
	},
	future: {
		hoverOnlyWhenSupported: true,
	},
	plugins: [],
};

export default config;
