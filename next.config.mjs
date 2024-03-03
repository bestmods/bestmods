// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
        {
            protocol: 'https',
            hostname: '**',
            port: '',
            pathname: '**',
        }
    ]
  },
  rewrites: async() => [
    {
      source: "/sitemap.xml",
      destination: "/sitemap/"
    },
    {
      source: "/sitemap-static.xml",
      destination: "/sitemap/static"
    },
    {
      source: "/sitemap-content/mod/:page.xml",
      destination: "/sitemap/content/mod/:page"
    },
    {
      source: "/sitemap-content/category/:page.xml",
      destination: "/sitemap/content/category/:page"
    }
  ]
};
export default config;
