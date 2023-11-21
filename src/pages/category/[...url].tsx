import React, { useState } from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import ModBrowser from "@components/mod/browser";

import { prisma } from "@server/db/client";

import { type Category } from "@prisma/client";
import { CategoryWithChildrenAndParent } from "~/types/category";

export default function Page ({
    category,
    cookies
} : {
    category: any,
    cookies: { [key: string]: string }
}) {
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";

    const [error, setError] = useState<JSX.Element | null>(null);
    const notFound = <div><h1 className="text-center text-white text-lg font-bold">Not Found</h1><p className="text-center text-white">Category or game within URL not found.</p></div>;

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

    const categories: Array<number> = [];

    if (category) {
        categories.push(category.id);

        if (error)
            setError(null);

        if (category.children) {
            category.children.map((child: Category) => {
                categories.push(child.id);
            });
        }
    } else if (!error)
        setError(notFound);

    const content = (!error) ?
        <div>
            <div className="w-full sm:w-4/5 mx-auto m-4">
                <h1 className="text-white text-3xl font-bold">
                    {category && category.parent ? (
                        <>
                            {category.parent.name} {"→"} {category.name + " "}
                        </>
                    ) : (
                        <>
                            {category && category.name + " "}
                        </>
                    )}
                </h1>
            </div>
            <ModBrowser
                categories={categories}
                visible={true}
            />
        </div>
        : error;

    let headTitle = undefined;
    let headDesc = undefined;
    let headerImg = undefined;

    if (bgFile)
        headerImg = cdn + bgPath

    if (category) {
        if (category.parent) {
            headTitle = category.parent.name + " " + category.name + " - Best Mods";
            headDesc = "Browse through many mods in " + category.parent.name + "'s " + category.name + " category!";
        } else {
            headTitle = category.name + " - Best Mods";
            headDesc = "Browse through many mods in " + category.name + "!";
        }
    }

    if (headDesc && category?.description)
        headDesc += `\n\n${category.description}`

    return (
        <>
            <MetaInfo
                title={headTitle}
                description={headDesc}
                image={headerImg}
            />
            {bgFile ? (
                <Main
                    image={bgPath}
                    showFilters={true}
                    cookies={cookies}
                >
                    {content}
                </Main>
            ) : (
                <Main
                    showFilters={true}
                    cookies={cookies}
                >
                    {content}
                </Main>
            )}
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

    const cookies: { [key: string]: string | undefined; } = { ...ctx.req.cookies };

    return { 
        props: {
            category: JSON.parse(JSON.stringify(category, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            cookies: cookies
        }
    }
}