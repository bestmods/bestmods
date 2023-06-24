import { type NextPage } from "next";
import React, { useState } from "react";

import { BestModsPage } from '../../components/main';
import HeadInfo from "../../components/head";

import ModBrowser from '../../components/mod_browser';

import { prisma } from '../../server/db/client';
import { type GetServerSidePropsContext } from 'next';
import { type Category } from "@prisma/client";

const Home: NextPage<{
    cat: any,
    cookies: { [key: string]: string } }
> = ({
    cat,
    cookies
}) => {
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";

    const [error, setError] = useState<JSX.Element | null>(null);
    const notFound = <div><h1 className="text-center text-white text-lg font-bold">Not Found</h1><p className="text-center text-white">Category or game within URL not found.</p></div>;

    let bgFile: string | null = null;

    if (cat) {
        if (cat.hasBg && cat.parent)
            bgFile = cat.parent.url + "_" + cat.url + ".png";
        else if (cat.hasBg && cat.parent == null)
            bgFile = cat.url + ".png";
        else if (cat.parent && cat.parent.hasBg)
            bgFile = cat.parent.url + ".png";
    }

    const bgPath = "/images/backgrounds/" + bgFile;

    const categories: Array<number> = [];

    if (cat) {
        categories.push(cat.id);

        if (error)
            setError(null);

        if (cat.children) {
            cat.children.map((child: Category) => {
                categories.push(child.id);
            });
        }
    } else if (!error)
        setError(notFound);

    const content = (!error) ?
        <div>
            <div className="w-full sm:w-4/5 mx-auto m-4">
                <h1 className="text-white text-3xl font-bold">
                    {cat && cat.parent ? (
                        <>
                            {cat.parent.name} {"→"} {cat.name + " "}
                        </>
                    ) : (
                        <>
                            {cat && cat.name + " "}
                        </>
                    )}
                </h1>
            </div>
            <ModBrowser categories={categories} />
        </div>
        : error;

    let headTitle = null;
    let headDesc = null;
    let headerImg = null;

    if (bgFile)
        headerImg = cdn + bgPath

    if (cat) {
        if (cat.parent) {
            headTitle = cat.parent.name + " " + cat.name + " - Best Mods";
            headDesc = "Browse through many mods in " + cat.parent.name + " " + cat.name + "!";
        } else {
            headTitle = cat.name + " - Best Mods";
            headDesc = "Browse through many mods in " + cat.name + "!";
        }
    }

    return (
        <>
            <HeadInfo
                title={headTitle}
                description={headDesc}
                image={headerImg}
            />
            {bgFile ? (
                <BestModsPage
                    image={bgPath}
                    showFilters={true}
                    cookies={cookies}
                >
                    {content}
                </BestModsPage>
            ) : (
                <BestModsPage
                    showFilters={true}
                    cookies={cookies}
                >
                    {content}
                </BestModsPage>
            )}
        </>
    );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // We need to retrieve some props.
    if (!ctx.params || !ctx.params.category) {
        return { 
            props: {
                cat: null
            }
        };
    }

    const cat1 = ctx.params.category[0] ?? null;
    const cat2 = ctx.params.category[1] ?? null;

    if (!cat1) {
        return {
            props: {
                cat: null
            }
        };
    }

    const cat = await prisma.category.findFirst({
        include: {
            children: true,
            parent: true
        },
        where: {
            url: (cat2) ? cat2 : cat1,
            ...(cat2 && {
                parent: {
                    url: cat1
                }
            })
        }
    });

    const cookies: { [key: string]: string | undefined; } = { ...ctx.req.cookies };

    return { 
        props: {
            cat: JSON.parse(JSON.stringify(cat, (_, v) => typeof v === 'bigint' ? v.toString() : v)),
            cookies: cookies
        }
    };
}

export default Home;
