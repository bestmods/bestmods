import React from "react";
import { type GetServerSidePropsContext } from "next";

import { prisma } from "@server/db/client";
import MetaInfo from "@components/meta";
import Main from "@components/main";
import NotFound from "@components/errors/notfound";

export default function Page () {
    return (
        <>
            <MetaInfo
                title="Not Found - Best Mods"
            />
            <Main>
                <NotFound />
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {

    // We need to retrieve some props.
    const { params, res } = ctx;

    const matchUrl = params?.match?.toString();
    const childUrl = params?.child?.toString();
    const moreUrl = params?.more;

    // Check if this a view URL.
    if (matchUrl == "view" && childUrl) {
        const modUrl = childUrl;
        const view = moreUrl?.[0]?.toString();

        // Check for redirect on main mod URL.
        const redirect = await prisma.redirect.findFirst({
            where: {
                url: `/view/${modUrl}`
            }
        })

        if (redirect) {
            res.statusCode = 301;

            let newUrl = redirect.redirect;

            // Check if we need to apppend view.
            if (view)
                newUrl += `/${view}`;

            res.setHeader("Location", newUrl)
        } else {
            return {
                notFound: true
            }
        }
    }

    return { 
        props: {

        }
    }
}