import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import ModBrowser from "@components/mod/browser";

export default function Page ({
    cookies
} : {
    cookies: { [key: string]: string }
}) {
    return (
        <>
            <MetaInfo 
                title={"Browser - Best Mods"}
            />
            <Main
                cookies={cookies}
            >
                <ModBrowser visible={true} />
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const cookies: { [key: string]: string | undefined; } = { ...ctx.req.cookies };

    return { 
        props: { 
            cookies: cookies
        }
    }
}