import { getServerSideSitemap } from "next-sitemap"
import { type GetServerSideProps } from "next"

import { prisma } from "@server/db/client";
import { GetModUrl } from "@utils/mod";
import { GetCategoryUrl } from "@utils/category";

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

    const baseUrl = process.env.SITEMAP_URL ?? "https://bestmods.io"

    // Push URLs we are already aware of.
    items.push({
        loc: baseUrl,
        lastmod: new Date().toISOString(),
        priority: 0.7,
        changefreq: "always"
    })
    items.push({
        loc: `${baseUrl}/browse`,
        lastmod: new Date().toISOString(),
        priority: 0.5,
        changefreq: "weekly"
    })
    items.push({
        loc: `${baseUrl}/category`,
        lastmod: new Date().toISOString(),
        priority: 0.5,
        changefreq: "weekly"
    });
    items.push({
        loc: `${baseUrl}/about`,
        lastmod: new Date().toISOString(),
        priority: 0.5,
        changefreq: "weekly"
    })

    // Handle mods.
    const mods = await prisma.mod.findMany({
        include: {
            category: {
                include: {
                    parent: true
                }
            },
        },
        where: {
            visible: true
        }
    });

    mods.map((mod) => {
        const url = GetModUrl(mod);

        items.push({
            loc: `${baseUrl}${url}`,
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
        const url = GetCategoryUrl(cat);

        items.push({
            loc: `${baseUrl}${url}`,
            lastmod: new Date().toISOString(),
            priority: 0.7,
            changefreq: "daily"
        });
    })

    return getServerSideSitemap(ctx, items)
}

// Default export to prevent next.js errors
export default getServerSideProps;