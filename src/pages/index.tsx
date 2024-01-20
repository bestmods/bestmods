import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { type ModRowBrowser } from "~/types/mod";
import ModCatalog from "@components/mod/catalog";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import { GetDeviceType } from "@utils/carousel";
import { GetModSlideshows } from "@utils/content/mod";

export default function Page ({
    latest = [],
    viewed = [],
    downloaded = [],
    top = [],
    topToday = [],
    defaultDevice = "md"
} : {
    latest: ModRowBrowser[]
    viewed: ModRowBrowser[]
    downloaded: ModRowBrowser[]
    top: ModRowBrowser[]
    topToday: ModRowBrowser[]
    defaultDevice?: string
}) {
    return (
        <>
            <MetaInfo />
            <Main>
                <ModCatalog
                    latestMods={latest}
                    viewedMods={viewed}
                    downloadedMods={downloaded}
                    topMods={top}
                    topModsToday={topToday}

                    showRowBottom={false}
                    defaultDevice={defaultDevice}
                />
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {    
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    const [latest, viewed, downloaded, top, topToday] = await GetModSlideshows({
        session: session
    })

    // Get default device type.
    const defaultDevice = GetDeviceType(ctx);

    return { 
        props: { 
            latest: JSON.parse(JSON.stringify(latest, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            viewed: JSON.parse(JSON.stringify(viewed, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            downloaded: JSON.parse(JSON.stringify(downloaded, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            top: JSON.parse(JSON.stringify(top, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            topToday: JSON.parse(JSON.stringify(topToday, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            defaultDevice: defaultDevice
        }
    }
}