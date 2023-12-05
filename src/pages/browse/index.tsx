import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import ModBrowser from "@components/mod/browser";

export default function Page () {
    return (
        <>
            <MetaInfo 
                title={"Browse - Best Mods"}
            />
            <Main>
                <ModBrowser visible={true} />
            </Main>
        </>
    )
}