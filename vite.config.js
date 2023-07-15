import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
	base: "",
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				restaurant: resolve(__dirname, "restaurant/index.html"),
				industry: resolve(__dirname, "industry/index.html"),
				ngo: resolve(__dirname, "ngo/index.html"),
				"restaurant/dashboard": resolve(__dirname, "restaurant/dashboard/index.html"),
				"industry/dashboard": resolve(__dirname, "industry/dashboard/index.html"),
				"ngo/dashboard": resolve(__dirname, "ngo/dashboard/index.html"),
			},
		},
	},
});
