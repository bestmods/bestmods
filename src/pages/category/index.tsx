import React from "react";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { prisma } from "@server/db/client";
import { type CategoryWithChildrenAndCounts } from "~/types/category";
import CategoryRowGrid from "@components/category/row/grid";

export default function Page ({
    categories
} : {
    categories: CategoryWithChildrenAndCounts[]
}) {
    const sortedCats = categories.sort((a, b) => {
        let aTot = a._count.Mod;

        a.children.forEach((v) => {
            aTot += v._count.Mod;
        })

        let bTot = b._count.Mod;

        b.children.forEach((v) => {
            bTot += v._count.Mod;
        })

        if (aTot > bTot)
            return -1;

        if (aTot < bTot)
            return 1;

        return 0;
    })

    return (
        <>
            <MetaInfo
                title="All Games & Categories - Best Mods"
                description="Choose what games and categories you want to see mods in!"
            />
            <Main>
                <h2>All Categories</h2>

                {sortedCats.length > 0 ? (
                    <div
                        className="grid gap-x-4 gap-y-6 py-6"
                        style={{
                            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr)"
                        }}
                    >
                        {sortedCats.map((category, index) => {
                            return (
                                <CategoryRowGrid
                                    key={`category-${index.toString()}`}
                                    category={category}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-white">No categories found.</p>
                )}
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
                    parent: true,
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
        },
        orderBy: {
            Mod: {
                _count: "desc"
            }
        }
    });

    return {
        props: {
            categories: categories
        }
    }
}
