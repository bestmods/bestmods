import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";


import { prisma } from "@server/db/client";

import { type CategoryWithChildrenAndParent } from "~/types/category";
import { type ModRowBrowser, ModRowBrowserSel } from "~/types/mod";
import ModCatalog from "@components/mod/catalog";

export default function Page ({
    category,
    latestMods = [],
    viewedMods = [],
    downloadedMods = []
} : {
    category?: CategoryWithChildrenAndParent
    latestMods: ModRowBrowser[]
    viewedMods: ModRowBrowser[]
    downloadedMods: ModRowBrowser[]
}) {
    let bgFile: string | null = null;

    if (category) {
        if (category.hasBg && category.parent)
            bgFile = category.parent.url + "_" + category.url + ".png";
        else if (category.hasBg && category.parent == null)
            bgFile = category.url + ".png";
        else if (category.parent && category.parent.hasBg)
            bgFile = category.parent.url + ".png";
    }

    const bgPath = "/images/backgrounds/" + bgFile;

    return (
        <>
            <MetaInfo
                title={`${category?.parent?.name ? `${category.parent.name} ` : ``}${category?.name ? `${category.name} ` : ``} - Best Mods`}
                description={category?.description ?? category?.parent?.description ?? undefined}
                image={bgFile ? bgPath : undefined}
            />
            <Main
                image={bgFile ? bgPath : undefined}
            >
                <h1>
                    {category?.parent && (
                        <>{category.parent.name} - </>
                    )}
                    {category && (
                        <>{category.name}</>
                    )}
                </h1>
                <ModCatalog
                    latestMods={latestMods}
                    viewedMods={viewedMods}
                    downloadedMods={downloadedMods}
                />
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // We need to retrieve some props.
    const { params } = ctx;

    const priUrl = params?.category?.[0]?.toString();
    const secUrl = params?.category?.[1]?.toString();

    let category: CategoryWithChildrenAndParent | null = null;

    if (priUrl) {
        if (secUrl) {
            category = await prisma.category.findFirst({
                include: {
                    parent: true,
                    children: true
                },
                where: {
                    parent: {
                        url: priUrl
                    },
                    url: secUrl
                }
            })
        } else {
            category = await prisma.category.findFirst({
                include: {
                    parent: true,
                    children: true
                },
                where: {
                    parent: null,
                    url: priUrl
                }
            })
        }
    }

    let latestMods: ModRowBrowser[] = [];
    let viewedMods: ModRowBrowser[] = [];
    let downloadedMods: ModRowBrowser[] = [];

    if (category) {
        latestMods = await prisma.mod.findMany({
            take: 10,
            select: ModRowBrowserSel,
            orderBy: {
                createAt: "desc"
            },
            where: {
                OR: [
                    {
                        categoryId: category.id
                    },
                    {
                        category: {
                            parentId: category.id
                        }
                    }
                ]
            }
        })

        viewedMods = await prisma.mod.findMany({
            take: 10,
            select: ModRowBrowserSel,
            orderBy: {
                totalViews: "desc"
            },
            where: {
                OR: [
                    {
                        categoryId: category.id
                    },
                    {
                        category: {
                            parentId: category.id
                        }
                    }
                ]
            }
        })

        downloadedMods = await prisma.mod.findMany({
            take: 10,
            select: ModRowBrowserSel,
            orderBy: {
                totalDownloads: "desc"
            },
            where: {
                OR: [
                    {
                        categoryId: category.id
                    },
                    {
                        category: {
                            parentId: category.id
                        }
                    }
                ]
            }
        })
    }

    return { 
        props: {
            category: JSON.parse(JSON.stringify(category, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            latestMods: JSON.parse(JSON.stringify(latestMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            viewedMods: JSON.parse(JSON.stringify(viewedMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            downloadedMods: JSON.parse(JSON.stringify(downloadedMods, (_, v) => typeof v === "bigint" ? v.toString() : v))
        }
    }
}