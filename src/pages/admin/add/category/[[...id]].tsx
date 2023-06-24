import { BestModsPage } from '../../../../components/main';

import { type GetServerSidePropsContext, type NextPage } from "next";
import React from "react";

import CategoryForm from "../../../../components/forms/contributor/create_category";

import HeadInfo from "../../../../components/head";

import { type Category } from '@prisma/client';

import { prisma } from '../../../../server/db/client'
import { getSession } from 'next-auth/react';
import { type CategoriesWithChildren } from '../../../../components/types';

const Home: NextPage<{
    authed: boolean,
    cat: Category,
    cats: CategoriesWithChildren[]
}> = ({
    authed,
    cat,
    cats
}) => {
    return (
        <>
            <HeadInfo />
            <BestModsPage>
                {authed ? (
                    <div className="container mx-auto">
                        <CategoryForm cat={cat} cats={cats} />
                    </div>
                ) : (
                    <div className="container mx-auto">
                        <h1 className="text-center text-white font-bold text-lg">You are not authorized to add or edit a category!</h1>
                    </div>                    
                )}
            </BestModsPage>
        </>
    );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Slugs.
    let id: number | null = null;

    // Props to pass.
    let cat: Category | null = null;
    let cats: CategoriesWithChildren[] = [];
    let authed = false;

    // See if we have a slug.
    if (ctx?.params?.id && ctx.params.id[0])
        id = Number(ctx?.params?.id[0]);

    // Retrieve session.
    const session = await getSession(ctx);

    // Make sure we have contributor permissions.
    const perm_check = await prisma.permissions.findFirst({
        where: {
            userId: session?.user?.id ?? "",
            perm: "contributor"
        }
    });

    if (perm_check)
        authed = true;

    if (authed) {
        // Retrieve category if any.
        cat = await prisma.category.findFirst({
            where: {
                id: id ?? 0
            },
            include: {
                parent: true
            }
        });

        // Retrieve all categories.
        cats = await prisma.category.findMany({
            where: {
                parentId: null
            },
            include: {
                children: true
            }
        });
    }

    return { 
        props: {
            authed: authed,
            cat: cat, 
            cats: cats 
        } 
    };
}

export default Home;
