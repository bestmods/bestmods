import { type NextPage } from "next";
import React, { useState, useContext } from "react";

import { BestModsPage } from '../../components/main';
import HeadInfo from "../../components/Head";

import ModBrowser from '../../components/modbrowser';

import { prisma } from '../../server/db/client';
import { GetServerSidePropsContext } from 'next';
import { Category } from "@prisma/client";

const Home: NextPage<{ cat: any, cdn: string }> = ({ cat, cdn="" }) => {
    const [error, setError] = useState<JSX.Element | null>(null);
    const notFound = <div><h1 className="text-center text-white text-lg font-bold">Not Found</h1><p className="text-center text-white">Category or game within URL not found.</p></div>;

    let bgFile: string | null = null;

    if (cat != null) {
        if (cat.hasBg && cat.parent != null)
            bgFile = cat.parent.url + "_" + cat.url + ".png";
        else if (cat.hasBg && cat.parent == null)
            bgFile = cat.url + ".png";
        else if (cat.parent != null && cat.parent.hasBg)
            bgFile = cat.parent.url + ".png";
    }
        
    const bgPath = "/images/backgrounds/" + bgFile;

    const categories: Array<number> = [];

    if (cat != null) {
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

    const content = (error == null) ?
        <div>
            <div className="w-full sm:w-4/5 mx-auto m-4">
                <h1 className="text-white text-3xl font-bold">
                    {cat != null && cat.parent != null ? (
                        <>
                            {cat.parent.name} {"→"} {cat.name + " "}
                        </>
                    ) : (
                        <>
                            {cat != null && cat.name + " "}
                        </>
                    )}
                    Mods
                </h1>
            </div>
            <ModBrowser categories={categories} />
        </div>    
        : error;

    let headTitle = null;
    let headDesc = null;
    let headerImg = null;

    if (bgFile)
        headerImg = bgPath

    if (cat != null) {
        if (cat.parent != null) {
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
            {bgFile != null ? (
                <BestModsPage
                    content={content}
                    image={bgPath}
                />
            ) : (
                <BestModsPage
                    content={content}
                />  
            )}
        </>
    );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // We need to retrieve some props.
    if (!ctx.params || !ctx.params.category)
      return { props: { cat: null } }
    
    const cat1 = ctx.params.category[0] ?? null;
    const cat2 = ctx.params.category[1] ?? null;

    if (!cat1)
        return { props: { cat: null } }
  
    const cat = await prisma.category.findFirst({
        include: {
            children: true,
            parent: true
        },
        where: {
            url: (cat2 != null) ? cat2 : cat1,
            ...(cat2 != null && {
                parent: {
                    url: cat1
                }
            })
        }
    });
  
    return { props: { cat: JSON.parse(JSON.stringify(cat, (_, v) => typeof v === 'bigint' ? v.toString() : v)), cdn: process.env.CDN_URL ?? ""} };
}  

export default Home;
