import { type NextPage } from "next";
import React, { useState } from "react";

import { BestModsPage } from '../../components/main';
import HeadInfo from "../../components/Head";

import { trpc } from '../../utils/trpc';
import Link from 'next/link';

const Home: NextPage = () => {
    return (
    <>
        <HeadInfo 
            title="All Games & Categories - Best Mods"
            description="Choose what games and categories you want to see mods in!"
        />
        <BestModsPage
            content={<Categories></Categories>}
        ></BestModsPage>
    </>
    );
};

const Categories: React.FC = () => {
    const catsQuery = trpc.category.getCategoriesMapping.useQuery({includeMods: true});
    const cats = catsQuery.data;

    return (
        <div className="container mx-auto bg-cyan-900/80 rounded-sm p-2 sm:p-16">
            <h1 className="text-white text-3xl font-bold text-center">All Categories</h1>

            {cats ? (
                <>
                    {cats.map((cat) => {
                        const viewLink = "/category/" + cat.url;
                        const icon = (cat.icon != null) ? cat.icon : "/images/default_icon.png"
                        
                        return (
                            <div key={"cat-" + cat.id} className="p-4">
                                <Link href={viewLink} className="flex items-center flex-wrap">
                                    <img src={icon} className="w-8 h-8" alt="Category Icon" />
                                    <span className="text-white ml-2">{cat.name}</span>{cat.Mod != null && cat.Mod.length > 0 && (
                                        <span className="text-sm text-white ml-2">({cat.Mod.length})</span>
                                    )}
                                </Link>
                                {cat.children.length > 0 && (
                                    <div className="p-4">
                                        {cat.children.map((catChild) => {
                                            const viewLinkChild = "/category/" + cat.url + "/" + catChild.url;
                                            const iconChild = (catChild.icon != null) ? catChild.icon : "/images/default_icon.png";

                                            return (
                                                <div key={"catchild-" + catChild.id} className="flex items-center flex-wrap ml-4">
                                                    <Link href={viewLinkChild} className="flex items-center flex-wrap">
                                                        <img src={iconChild} className="w-8 h-8" alt="Category Child Icon" />
                                                        <span className="text-white ml-2">{catChild.name}</span>{catChild.Mod != null && catChild.Mod.length > 0 && (
                                        <span className="text-sm text-white ml-2">({catChild.Mod.length})</span>
                                    )}
                                                    </Link>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </>
            ) : (
                <p className="text-white">No categories found.</p>
            )}
        </div>
    );
}


export default Home;
