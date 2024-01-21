import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { prisma } from "@server/db/client";

import { type CategoryWithParentAndCount } from "~/types/category";
import ModCatalog from "@components/mod/catalog";
import NotFound from "@components/errors/notfound";
import { GetCategoryBanner, GetCategoryBgImage, GetCategoryMetaDesc, GetCategoryMetaTitle } from "@utils/category";
import IndexInfo from "@components/index_info";

export default function Page ({
    category,
} : {
    category?: CategoryWithParentAndCount
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
                        <IndexInfo
                            category={category}
                            modCnt={totMods}
                        />
                        <ModCatalog
                            topTodaySSR={false}
                            latestSSR={false}
                            viewedSSR={false}
                            downloadedSSR={false}
                            topSSR={false}

                            categories={[category.id]}

                            showRowBottom={false}
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

    return { 
        props: {
            category: JSON.parse(JSON.stringify(category, (_, v) => typeof v === "bigint" ? v.toString() : v))
        }
    }
}