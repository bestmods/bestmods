import { type NextPage } from "next";
import React from "react";

import { BestModsPage } from '../../components/main';
import HeadInfo from "../../components/Head";

import { trpc } from '../../utils/trpc';
import Link from 'next/link';
import { type Category } from "@prisma/client";

const Home: NextPage = () => {
    return (
    <>
        <HeadInfo 
            title="All Games & Categories - Best Mods"
            description="Choose what games and categories you want to see mods in!"
        />
        <BestModsPage
            content={<Categories />}
        />
    </>
    );
};

const ChildRender: React.FC<{ child: Category, parent: any, cdn: string }> = ({ child, parent, cdn }) => {
    const query = trpc.category.getModCnt.useQuery({ id: child.id });
    const ctnData = query.data;

    const viewLinkChild = "/category/" + parent.url + "/" + child.url;
    const iconChild = (child.icon != null) ? child.icon : cdn + "/images/default_icon.png";

    return (
        <div className="flex items-center flex-wrap ml-4 mb-4">
            <Link href={viewLinkChild} className="flex items-center flex-wrap">
                <img src={iconChild} className="w-8 h-8" alt="Category Child Icon" />
                <span className="text-sm text-white ml-2">{child.name} ({ctnData?._count?.Mod ?? 0})</span>
            </Link>
        </div>
    );
}

const Categories: React.FC = () => {
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";

    const catsQuery = trpc.category.getCategoriesMapping.useQuery({selId: true, selName: true, selUrl: true, selIcon: true, incChildren: true, incModsCnt: true});
    const cats = catsQuery.data;

    return (
        <div className="container mx-auto bg-cyan-900/80 rounded-sm p-2 sm:p-16">
            <h1 className="text-white text-3xl font-bold text-center">All Categories</h1>

            {cats ? (
                <>
                    {cats.map((cat) => {
                        const viewLink = "/category/" + cat.url;
                        const icon = (cat.icon != null) ? cdn + cat.icon : cdn + "/images/default_icon.png"
                        
                        return (
                            <div key={"cat-" + cat.id} className="p-4">
                                <Link href={viewLink} className="flex items-center flex-wrap">
                                    <img src={icon} className="w-8 h-8" alt="Category Icon" />
                                    <span className="text-white ml-2">{cat.name} ({cat._count?.Mod ?? 0})</span>
                                </Link>
                                {cat.children.length > 0 && (
                                    <div className="p-4">
                                        {cat.children.map((catChild: any) => {
                                            return (
                                                <ChildRender
                                                    key={"catchild-" + catChild.id} 
                                                    child={catChild}
                                                    parent={cat}
                                                    cdn={cdn}
                                                />
                                            );
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
