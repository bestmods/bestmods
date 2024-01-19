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
import NotFound from "@components/errors/notfound";
import { GetDeviceType } from "@utils/carousel";
import { GetCategoryBanner, GetCategoryBgImage, GetCategoryMetaDesc, GetCategoryMetaTitle } from "@utils/category";

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
    // Retrieve banner.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    const banner = GetCategoryBanner(category, cdn);

    // Retrieve background image.
    const bgPath = GetCategoryBgImage(category);

    let totMods = category?._count?.Mod ?? 0;

    if (category?.children)
        category.children.map(child => totMods += child._count.Mod);

    // Meta information.
    const title = GetCategoryMetaTitle(category);
    const desc = GetCategoryMetaDesc(category, totMods);

    return (
        <>
            <MetaInfo
                title={title}
                description={desc}
                image={banner ?? bgPath}
            />
            <Main image={bgPath}>
                {category ? (
                    <>
                        <h2>
                            {category?.parent && (
                                <>{category.parent.name} - </>
                            )}
                            {category && (
                                <>{category.name}</>
                            )}
                        </h2>
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

    // This should represent a category.
    const catUrl = params?.match?.toString();

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
            userId: session?.user?.id,
            incDownloads: false,
            incSources: false,
            incInstallers: false
        }))[0]

        viewedMods = (await GetMods ({
            categories: categories,
            sort: 1,
            visible: true,
            userId: session?.user?.id,
            incDownloads: false,
            incSources: false,
            incInstallers: false
        }))[0]

        downloadedMods = (await GetMods ({
            categories: categories,
            sort: 2,
            visible: true,
            userId: session?.user?.id,
            incDownloads: false,
            incSources: false,
            incInstallers: false
        }))[0]

        topMods = (await GetMods ({
            categories: categories,
            visible: true,
            userId: session?.user?.id,
            incDownloads: false,
            incSources: false,
            incInstallers: false
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
            userId: session?.user?.id,
            incDownloads: false,
            incSources: false,
            incInstallers: false
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