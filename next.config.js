/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	swcMinify: true,
	webpack: (config, { isServer }) => {
		if (!isServer && config?.node) config.node = { fs: 'empty' }

		return config
	},
	env: {
		NEXT_PUBLIC_GMAP_KEY: process.env.GMAP_KEY,
	},
	rewrites: async () => [
		{
			source: '/api/gmap/:path*',
			destination: 'https://maps.googleapis.com/:path*',
		},
	],
}
