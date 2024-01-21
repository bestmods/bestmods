import React from "react";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import ModCatalog from "@components/mod/catalog";

import { prisma } from "@server/db/client";
import IndexInfo from "@components/index_info";

export default function Page ({
    modCnt,
} : {
    modCnt: number
}) {
    return (
        <>
            <MetaInfo />
            <Main>
                <IndexInfo modCnt={modCnt} />
                <ModCatalog
                    topTodaySSR={false}
                    latestSSR={false}
                    viewedSSR={false}
                    downloadedSSR={false}
                    topSSR={false}

                    showRowBottom={false}
                />
            </Main>
        </>
    )
}

export async function getServerSideProps() {    
    const modCnt = await prisma.mod.count();

    return { 
        props: {
            modCnt: modCnt
        }
    }
}