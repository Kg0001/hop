import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	turbopack: {
		// Set project root to silence multiple lockfile warning
		root: __dirname,
	},
};

export default nextConfig;
