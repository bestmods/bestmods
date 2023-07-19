import React from "react";
import { type NextPage } from "next";

import { BestModsPage } from "@components/main";
import HeadInfo from "@components/head";

import CategoryRow from "@components/category/row";

import { prisma } from "@server/db/client";

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
                            <React.Fragment key={"category-" + cat.id}>
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
                                                    key={"category-child-" + cat_child.id}
                                                    parent={cat}
                                                    cat={cat_child}
                                                    include_mod_count={true}
                                                    classes={["p-4", "ml-10"]}
                                                />
                                            );
                                        })}
                                    </>
                                )}
                            </React.Fragment>
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
