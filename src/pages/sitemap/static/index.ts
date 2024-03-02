import { type GetServerSideProps } from "next";
import { sitemapReturnSecs, sitemapStale } from "@pages/sitemap/index";


import { type ISitemapField, getServerSideSitemapLegacy } from "next-sitemap";

export const getServerSideProps: GetServerSideProps = async ctx => {
    const siteUrl = process.env.SITEMAP_URL ?? "";

    // Set cache headers.
    ctx.res.setHeader(
        'Cache-Control',
        `public, s-maxage=${sitemapStale}, stale-while-revalidate=${sitemapReturnSecs}`
    );

    const items: ISitemapField[] = [];

    items.push({
        loc: siteUrl,
        lastmod: new Date().toISOString(),
        priority: 0.7,
        changefreq: "always"
    })
    items.push({
        loc: `${siteUrl}/browse`,
        lastmod: new Date().toISOString(),
        priority: 0.5,
        changefreq: "weekly"
    })
    items.push({
        loc: `${siteUrl}/category`,
        lastmod: new Date().toISOString(),
        priority: 0.5,
        changefreq: "weekly"
    });
    items.push({
        loc: `${siteUrl}/about`,
        lastmod: new Date().toISOString(),
        priority: 0.5,
        changefreq: "weekly"
    })

    return getServerSideSitemapLegacy(ctx, items);
}

export default getServerSideProps;