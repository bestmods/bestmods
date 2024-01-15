import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { prisma } from "@server/db/client";

import { type CategoryWithChildrenAndParentAndCount } from "~/types/category";
import { type ModRowBrowser } from "~/types/mod";
import ModCatalog from "@components/mod/catalog";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import { GetMods } from "@utils/content/mod";
import { GetBgImage } from "@utils/images";
import NotFound from "@components/errors/notfound";
import { GetDeviceType } from "@utils/carousel";

export default function Page ({
    category,
    latestMods = [],
    viewedMods = [],
    downloadedMods = [],
    topMods = [],
    topModsToday = [],
    defaultDevice = "md"
} : {
    category?: CategoryWithChildrenAndParentAndCount
    latestMods: ModRowBrowser[]
    viewedMods: ModRowBrowser[]
    downloadedMods: ModRowBrowser[]
    topMods: ModRowBrowser[]
    topModsToday: ModRowBrowser[]
    defaultDevice?: string
}) {
    const bgPath = GetBgImage(category);
    const desc = category?.description ?? category?.parent?.description ?? "";

    let totMods = category?._count?.Mod ?? 0;

    if (category?.children)
        category.children.map(child => totMods += child._count.Mod);

    return (
        <>
            <MetaInfo
                title={`${category?.parent?.name ? `${category.parent.name} ` : ``}${category?.name ? `${category.name} ` : `Not Found`} - Best Mods`}
                description={`Tracking ${totMods.toString()} mods!${desc ? ` ${desc}` : ``}`}
                image={bgPath}
            />
            <Main image={bgPath}>
                {category ? (
                    <>
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
                            topMods={topMods}
                            topModsToday={topModsToday}
                            defaultDevice={defaultDevice}
                        />
                    </>
                ) : (
                    <NotFound item="category" />
                )}
                
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const session = await getServerAuthSession(ctx);

    // We need to retrieve some props.
    const { params, req, res } = ctx;

    const catUrl = params?.category?.toString();

    let category: CategoryWithChildrenAndParentAndCount | null = null;
    const categories: number[] = [];

    if (catUrl) {
        category = await prisma.category.findFirst({
            include: {
                _count: {
                    select: {
                        Mod: true
                    }
                },
                parent: true,
                children: {
                    include: {
                        _count: {
                            select: {
                                Mod: true
                            }
                        }
                    }
                }
            },
            where: {
                parent: null,
                url: catUrl
            }
        })
    }

    if (category) {
        categories.push(category.id);

        if (category.children.length > 0) {
            category.children.map((child) => {
                categories.push(child.id);
            })
        }
    } else {
        let redirected = false;

        // Look for redirect.
        const pathName = req.url;

        if (pathName) {
            const redirect = await prisma.redirect.findFirst({
                where: {
                    url: pathName
                }
            });

            // Check if we found a redirect.
            if (redirect) {
                // Set status code to 301.
                res.statusCode = 301;

                res.setHeader("Location", redirect.redirect);

                redirected = true;
            }
        }

        if (!redirected) {
            return {
                notFound: true
            }
        }
    }

    let latestMods: ModRowBrowser[] = [];
    let viewedMods: ModRowBrowser[] = [];
    let downloadedMods: ModRowBrowser[] = [];
    let topMods: ModRowBrowser[] = [];
    let topModsToday: ModRowBrowser[]  = []

    if (categories.length > 0) {
        latestMods = (await GetMods ({
            categories: categories,
            sort: 4,
            visible: true,
            userId: session?.user?.id
        }))[0]

        viewedMods = (await GetMods ({
            categories: categories,
            sort: 1,
            visible: true,
            userId: session?.user?.id
        }))[0]

        downloadedMods = (await GetMods ({
            categories: categories,
            sort: 2,
            visible: true,
            userId: session?.user?.id
        }))[0]

        topMods = (await GetMods ({
            categories: categories,
            visible: true,
            userId: session?.user?.id
        }))[0]
    
        // Retrieve time range for today.
        let todayDate = new Date(Date.now() - (86400 * 1000));
    
        todayDate = new Date(
            todayDate.getUTCFullYear(),
            todayDate.getUTCMonth(),
            todayDate.getUTCDate(),
            todayDate.getUTCHours(),
            todayDate.getUTCMinutes(),
            todayDate.getUTCSeconds(),
            todayDate.getUTCMilliseconds()
        )
    
        topModsToday = (await GetMods ({
            categories: categories,
            ratingTimeRange: todayDate,
            visible: true,
            userId: session?.user?.id
        }))[0]
    }

    // Get default device.
    const defaultDevice = GetDeviceType(ctx);

    return { 
        props: {
            category: JSON.parse(JSON.stringify(category, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            latestMods: JSON.parse(JSON.stringify(latestMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            viewedMods: JSON.parse(JSON.stringify(viewedMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            downloadedMods: JSON.parse(JSON.stringify(downloadedMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            topMods: JSON.parse(JSON.stringify(topMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            topModsToday: JSON.parse(JSON.stringify(topModsToday, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            defaultDevice: defaultDevice
        }
    }
}