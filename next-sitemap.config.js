/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITEMAP_URL || "https://bestmods.io",
    sitemapSize: 5000,
    generateIndexSitemap: false
  }