import { getServerSideSitemap } from 'next-sitemap'
import { GetServerSideProps } from 'next'

import { prisma } from "../../server/db/client";

type Changefreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const items: Array<{loc: string, lastmod: string, priority?: number, changefreq?: Changefreq }> = [];

    // Push URLs we are already aware of.
    items.push({loc: "https://bestmods.io", lastmod: new Date().toISOString(), priority: 0.7, changefreq: "always"})
    items.push({loc: "https://bestmods.io/category", lastmod: new Date().toISOString(), priority: 0.4});

    // Handle mods.
    const mods = await prisma.mod.findMany();

    mods.map((mod) => {
        items.push({loc: "https://bestmods.io/view/" + mod.url, lastmod: new Date().toISOString(), priority: 0.7});
    })

    // Handle categories.
    const cats = await prisma.category.findMany({
        include: {
            parent: true
        }
    });

    cats.map((cat) => {
        let end = cat.url;

        if (cat.parent != null)
            end = cat.parent.url + "/" + cat.url;

        items.push({loc: "https://bestmods.io/category/" + end, lastmod: new Date().toISOString(), priority: 0.5});
    })

    return getServerSideSitemap(ctx, items)
}

// Default export to prevent next.js errors
export default getServerSideProps;