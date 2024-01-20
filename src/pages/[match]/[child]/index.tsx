import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { prisma } from "@server/db/client";

import { type CategoryWithParentAndCount } from "~/types/category";
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
    category?: CategoryWithParentAndCount
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

    const totMods = category?._count?.Mod ?? 0;

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
                                <>{category.parent.name} -{">"} </>
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

                            showRowBottom={false}
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

    // This should be the category child.
    const catUrl = params?.match?.toString();
    const childUrl = params?.child?.toString();

    let category: CategoryWithParentAndCount | null = null;

    if (catUrl && childUrl) {
        category = await prisma.category.findFirst({
            include: {
                _count: {
                    select: {
                        Mod: true
                    }
                },
                parent: true
            },
            where: {
                parent: {
                    url: catUrl
                },
                url: childUrl
            }
        })
    }

    if (!category) {
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

    if (category) {
        [latest, viewed, downloaded, top, topToday] = await GetModSlideshows({
            session: session,
            categories: [category.id]
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