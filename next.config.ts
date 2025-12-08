import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	// Disable source maps in development to avoid warnings
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	webpack: (config, { dev, isServer }) => {
		if (dev) {
			config.devtool = false;
		}
		return config;
	},
};

export default nextConfig;