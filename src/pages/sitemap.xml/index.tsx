import { getServerSideSitemap } from "next-sitemap"
import { type GetServerSideProps } from "next"

import { prisma } from "@server/db/client";

type Changefreq =
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const items: Array<{ loc: string, lastmod: string, priority?: number, changefreq?: Changefreq }> = [];

    const url = process.env.SITEMAP_URL ?? "https://bestmods.io"

    // Push URLs we are already aware of.
    items.push({
        loc: url,
        lastmod: new Date().toISOString(),
        priority: 0.7,
        changefreq: "always"
    })
    items.push({
        loc: `${url}/browse`,
        lastmod: new Date().toISOString(),
        priority: 0.5,
        changefreq: "weekly"
    })
    items.push({
        loc: `${url}/category`,
        lastmod: new Date().toISOString(),
        priority: 0.5,
        changefreq: "weekly"
    });
    items.push({
        loc: `${url}/about`,
        lastmod: new Date().toISOString(),
        priority: 0.5,
        changefreq: "weekly"
    })

    // Handle mods.
    const mods = await prisma.mod.findMany({
        where: {
            visible: true
        }
    });

    mods.map((mod) => {
        items.push({
            loc: `${url}/view/${mod.url}`,
            lastmod: mod?.editAt?.toISOString() ?? new Date().toISOString(),
            priority: 0.7,
            changefreq: "daily"
        });
    })

    // Handle categories.
    const cats = await prisma.category.findMany({
        include: {
            parent: true
        }
    });

    cats.map((cat) => {
        let end = cat.url;

        if (cat.parent)
            end = cat.parent.url + "/" + cat.url;

        items.push({
            loc: `${url}/category/${end}`,
            lastmod: new Date().toISOString(),
            priority: 0.7,
            changefreq: "daily"
        });
    })

    return getServerSideSitemap(ctx, items)
}

// Default export to prevent next.js errors
export default getServerSideProps;