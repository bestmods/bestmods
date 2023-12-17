import React from "react";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import ModBrowser from "@components/mod/browser";

export default function Page () {
    return (
        <>
            <MetaInfo 
                title="Browse - Best Mods"
                description="Browse the best mods on the Internet with in-depth filtering!"
            />
            <Main>
                <ModBrowser visible={true} />
            </Main>
        </>
    )
}