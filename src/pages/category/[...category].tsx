import { type NextPage } from "next";
import React, { useState, useContext } from "react";
import { useRouter } from 'next/router'

import { BestModsPage } from '../../components/main';
import HeadInfo from "../../components/Head";

import ModBrowser from '../../components/modbrowser';

import { trpc } from "../../utils/trpc";

import { CfgCtx } from "../../components/main";

const Home: NextPage = () => {
    // Retrieve config and CDN.
    const cfg = useContext(CfgCtx);

    let cdn = "";

    if (cfg && cfg.cdn)
        cdn = cfg.cdn;

    const [error, setError] = useState<JSX.Element | null>(null);
    const notFound = <div><h1 className="text-center text-white text-lg font-bold">Not Found</h1><p className="text-center text-white">Category or game within URL not found.</p></div>;

    const { query } = useRouter();

    const category = (query.category != null) ? query.category[0] : null;
    const category2 = (query.category != null && query.category[1] != null) ? query.category[1] : null; 

    const categoryQuery = trpc.category.getCategory.useQuery({
        url: (category2) ? category2 : category ?? null,
        parentUrl: (category2) ? category : null
    });

    const cat = categoryQuery.data;

    let bgFile: string | null = null;

    if (cat != null) {
        if (cat.hasBg && cat.parent != null)
            bgFile = cat.parent.url + "_" + cat.url + ".png";
        else if (cat.hasBg && cat.parent == null)
            bgFile = cat.url + ".png";
        else if (cat.parent != null && cat.parent.hasBg)
            bgFile = cat.parent.url + ".png";
    }
        
    const bgPath = cdn + "/images/backgrounds/" + bgFile;

    const categories: Array<number> = [];

    if (cat != null) {
        categories.push(cat.id);

        if (error)
            setError(null);

        if (cat.children) {
            cat.children.map((child) => {
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
        headerImg = "/images/backgrounds/" + bgFile

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


export default Home;
