import { getServerSideSitemapIndexLegacy } from "next-sitemap"
import { type GetServerSideProps } from "next"

import { prisma } from "@server/db/client";
import { sitemapReturnSecs, sitemapStale } from "@pages/sitemap/index";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const siteUrl = process.env.SITEMAP_URL ?? "";

    const sitemaps: string[] = [];

    // Set cache headers.
    ctx.res.setHeader(
        'Cache-Control',
        `public, s-maxage=${sitemapStale}, stale-while-revalidate=${sitemapReturnSecs}`
    );

    // We need to determine how many pages of mods and categores we have.
    const items_per_page = Number(process.env.SITEMAP_MAX_ITEMS ?? 5000);

    const mods = await prisma.mod.count();
    const categories = await prisma.category.count();

    const mods_pages = Math.ceil(mods / items_per_page);
    const categories_pages = Math.ceil(categories / items_per_page);

    let i;

    // We need to create a for loop and add each page.
    for (i = 1; i <= mods_pages; i++) {
        sitemaps.push(`${siteUrl}/sitemap-content/mod/${i.toString()}.xml`)
    }

    for (i = 1; i <= categories_pages; i++) {
        sitemaps.push(`${siteUrl}/sitemap-content/category/${i.toString()}.xml`)
    }

    return getServerSideSitemapIndexLegacy(ctx, sitemaps);
}

export default getServerSideProps;