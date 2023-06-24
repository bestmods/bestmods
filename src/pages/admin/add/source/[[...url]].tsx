import { BestModsPage } from '../../../../components/main';

import { type GetServerSidePropsContext, type NextPage } from "next";
import React from "react";

import HeadInfo from "../../../../components/head";

import { type Source } from '@prisma/client';

import { prisma } from '../../../../server/db/client'
import { getSession } from 'next-auth/react';
import SourceForm from '../../../../components/forms/contributor/create_source';

const Home: NextPage<{
    authed: boolean,
    src: Source
}> = ({
    authed,
    src
}) => {
    return (
        <>
            <HeadInfo />
            <BestModsPage>
                {authed ? (
                    <div className="container mx-auto">
                        <SourceForm src={src} />
                    </div>
                ) : (
                    <div className="container mx-auto">
                        <h1 className="text-center text-white font-bold text-lg">You are not authorized to add or edit a source!</h1>
                    </div>                    
                )}
            </BestModsPage>
        </>
    );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Slugs.
    let url: string | null = null;

    // Props to pass.
    let src: Source | null = null;
    let authed = false;

    // See if we have a slug.
    if (ctx?.params?.url && ctx.params.url[0])
        url = ctx?.params?.url[0];

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
        // Retrieve source if any.
        src = await prisma.source.findFirst({
            where: {
                url: url ?? ""
            }
        });
    }

    return { 
        props: {
            authed: authed,
            src: src
        } 
    };
}

export default Home;
