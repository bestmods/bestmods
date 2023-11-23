import React from "react";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import CategoryRow from "@components/category/row";

import { prisma } from "@server/db/client";
import { type CategoryWithChildrenAndCounts } from "~/types/category";

export default function Page ({
    categories
} : {
    categories: CategoryWithChildrenAndCounts[]
}) {
    return (
        <>
            <MetaInfo
                title="All Games & Categories - Best Mods"
                description="Choose what games and categories you want to see mods in!"
            />
            <Main>
                <div className="category-container">
                    <h1 className="page-title">All Categories</h1>

                    {categories ? (
                        <>
                            {categories.map((category) => {
                                return (
                                    <React.Fragment key={`category-${category.id}`}>
                                        <CategoryRow
                                            cat={category}
                                            include_mod_count={true}
                                            className={"p-4"}
                                        />
                                        {category.children.length > 0 && (
                                            <>
                                                {category.children.map((categoryChild) => {

                                                    return (
                                                        <CategoryRow
                                                            key={`category-child-${categoryChild.id}`}
                                                            parent={category}
                                                            cat={categoryChild}
                                                            include_mod_count={true}
                                                            className={"p-4 ml-10"}
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
            </Main>
        </>
    )
}

export async function getServerSideProps() {
    const categories = await prisma.category.findMany({
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
            categories: categories
        }
    }
}
