import { type NextPage } from "next";
import React from "react";

import { BestModsPage } from '../../components/main';
import HeadInfo from "../../components/head";

import Link from 'next/link';

import { prisma } from '../../server/db/client';

import CategoryRow from '../../components/category/row';

const Home: NextPage<{
    cats: any
}> = ({
    cats
}) => {
    return (
        <>
            <HeadInfo
                title="All Games & Categories - Best Mods"
                description="Choose what games and categories you want to see mods in!"
            />
            <BestModsPage>
                <Categories cats={cats} />
            </BestModsPage>
        </>
    );
};

const ChildRender: React.FC<{
    child: any,
    parent: any,
    cdn: string
}> = ({
    child,
    parent,
    cdn
}) => {
    const viewLinkChild = "/category/" + parent.url + "/" + child.url;
    const iconChild = (child.icon) ? child.icon : cdn + "/images/default_icon.png";

    return (
        <div className="flex items-center flex-wrap ml-4 mb-4">
            <Link href={viewLinkChild} className="flex items-center flex-wrap">
                <img src={iconChild} className="w-8 h-8" alt="Category Child Icon" />
                <span className="text-sm text-white ml-2">{child.name} ({child._count?.Mod ?? 0})</span>
            </Link>
        </div>
    );
}

const Categories: React.FC<{
    cats: any
}> = ({
    cats
}) => {
    return (
        <div className="category-container">
            <h1 className="page-title">All Categories</h1>

            {cats ? (
                <>
                    {cats.map((cat: any) => {
                        return (
                            <>
                                <CategoryRow
                                    cat={cat}
                                    include_mod_count={true}
                                    classes={["p-4"]}
                                />
                                {cat.children.length > 0 && (
                                    <>
                                        {cat.children.map((cat_child: any) => {
                                            return (
                                                <CategoryRow
                                                    cat={cat_child}
                                                    include_mod_count={true}
                                                    classes={["p-4", "ml-10"]}
                                                />
                                            );
                                        })}
                                    </>
                                )}
                            </>
                        );
                    })}
                </>
            ) : (
                <p className="text-white">No categories found.</p>
            )}
        </div>
    );
}

export async function getServerSideProps() {
    const cats = await prisma.category.findMany({
        where: {
            parentId: null
        },
        include: {
            children: {
                select: {
                    id: true,
                    name: true,
                    icon: true,
                    url: true,
                    _count: {
                        select: {
                            Mod: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    Mod: true
                }
            }
        }
    });

    return {
        props: {
            cats: cats
        }
    };
}


export default Home;
