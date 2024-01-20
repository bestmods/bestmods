import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { prisma } from "@server/db/client";

import { type CategoryWithChildrenAndParentAndCount } from "~/types/category";
import { type ModRowBrowser } from "~/types/mod";
import ModCatalog from "@components/mod/catalog";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import { GetModSlideshows } from "@utils/content/mod";
import NotFound from "@components/errors/notfound";
import { GetDeviceType } from "@utils/carousel";
import { GetCategoryBanner, GetCategoryBgImage, GetCategoryMetaDesc, GetCategoryMetaTitle } from "@utils/category";

export default function Page ({
    category,
    latest = [],
    viewed = [],
    downloaded = [],
    top = [],
    topToday = [],
    defaultDevice = "md"
} : {
    category?: CategoryWithChildrenAndParentAndCount
    latest: ModRowBrowser[]
    viewed: ModRowBrowser[]
    downloaded: ModRowBrowser[]
    top: ModRowBrowser[]
    topToday: ModRowBrowser[]
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
                            latestMods={latest}
                            viewedMods={viewed}
                            downloadedMods={downloaded}
                            topMods={top}
                            topModsToday={topToday}
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

    let latest: ModRowBrowser[] = [];
    let viewed: ModRowBrowser[] = [];
    let downloaded: ModRowBrowser[] = [];
    let top: ModRowBrowser[] = [];
    let topToday: ModRowBrowser[]  = []

    if (categories.length > 0) {
        [latest, viewed, downloaded, top, topToday] = await GetModSlideshows({
            session: session,
            categories: categories
        })
    }

    // Get default device.
    const defaultDevice = GetDeviceType(ctx);

    return { 
        props: {
            category: JSON.parse(JSON.stringify(category, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            latest: JSON.parse(JSON.stringify(latest, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            viewed: JSON.parse(JSON.stringify(viewed, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            downloaded: JSON.parse(JSON.stringify(downloaded, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            top: JSON.parse(JSON.stringify(top, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            topToday: JSON.parse(JSON.stringify(topToday, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            defaultDevice: defaultDevice
        }
    }
}