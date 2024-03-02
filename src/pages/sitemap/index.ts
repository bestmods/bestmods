import { getServerSideSitemapIndexLegacy } from "next-sitemap"
import { type GetServerSideProps } from "next"

export const sitemapStale =  60;
export const sitemapReturnSecs =  15 * 60;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const siteUrl = process.env.SITEMAP_URL ?? "";

    const sitemaps: string[] = [];

    sitemaps.push(`${siteUrl}/sitemap-content.xml`)
    sitemaps.push(`${siteUrl}/sitemap-static.xml`);

    return getServerSideSitemapIndexLegacy(ctx, sitemaps);
}

export default getServerSideProps;