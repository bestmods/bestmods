import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { prisma } from "@server/db/client";

import { type CategoryWithChildrenAndParentAndCount } from "~/types/category";
import ModCatalog from "@components/mod/catalog";
import NotFound from "@components/errors/notfound";
import { GetCategoryBanner, GetCategoryBgImage, GetCategoryMetaDesc, GetCategoryMetaTitle } from "@utils/category";
import IndexInfo from "@components/index_info";

export default function Page ({
    category,
    categories
} : {
    category?: CategoryWithChildrenAndParentAndCount
    categories?: number[]
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
                            
                            categories={categories}

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


    return { 
        props: {
            category: JSON.parse(JSON.stringify(category, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            categories: categories
        }
    }
}