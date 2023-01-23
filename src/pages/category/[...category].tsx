import { type NextPage } from "next";
import React, { useState } from "react";
import { useRouter } from 'next/router'

import { BestModsPage } from '../../components/main';
import HeadInfo from "../../components/Head";

import ModBrowser from '../../components/modbrowser';

import { trpc } from "../../utils/trpc";

const Home: NextPage = () => {
    const [error, setError] = useState<JSX.Element | null>(null);
    const notFound = <div><h1 className="text-center text-white text-lg font-bold">Not Found</h1><p className="text-center text-white">Category or game within URL not found.</p></div>;

    const { query } = useRouter();

    const category = (query.category != null) ? query.category[0] : null;
    const category2 = (query.category != null && query.category[1] != null) ? query.category[1] : null; 

    const categoryParQuery = trpc.category.getCategory.useQuery({
        id: null,
        url: (category2) ? category ?? null : null,
        parent: 0
    });

    const parentId: number | null = (categoryParQuery.data) ? categoryParQuery.data.id : null;

    const categoryQuery = trpc.category.getCategory.useQuery({
        id: null,
        url: (category2) ? category2 : category ?? null,
        parent: parentId
    });

    const cat = categoryQuery.data;
    const cat2 = categoryParQuery.data;

    let bgFile = "notfound.png";

    if (cat2 != null && cat != null)
        bgFile = cat2.url + "_" + cat.url + ".png";
    else if (cat != null)
        bgFile = cat.url + ".png";

    const bgPath = "/images/backgrounds/" + bgFile;

    const bgQuery = trpc.files.doesExist.useQuery({
        path: bgPath
    })

    const bg = bgQuery.data;

    const categories: Array<number> = [];

    if (category != null) {
        if (cat) {
            categories.push(cat.id);

            if (error)
                setError(null);
        } else {
            if (!error)
                setError(notFound);
        }

        if (cat && !cat2 && cat.children ) {
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
                    {cat2 == null && cat != null && cat.parent != null ? (
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

    return (
        <>
            <HeadInfo />
            {bg !== false ? (
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
