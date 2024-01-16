import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { type ModRowBrowser } from "~/types/mod";
import ModCatalog from "@components/mod/catalog";
import { GetMods } from "@utils/content/mod";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import { GetDeviceType } from "@utils/carousel";

export default function Page ({
    latestMods = [],
    viewedMods = [],
    downloadedMods = [],
    topMods = [],
    topModsToday = [],
    defaultDevice = "md"
} : {
    latestMods: ModRowBrowser[]
    viewedMods: ModRowBrowser[]
    downloadedMods: ModRowBrowser[]
    topMods: ModRowBrowser[]
    topModsToday: ModRowBrowser[]
    defaultDevice?: string
}) {
    return (
        <>
            <MetaInfo />
            <Main>
                <ModCatalog
                    latestMods={latestMods}
                    viewedMods={viewedMods}
                    downloadedMods={downloadedMods}
                    topMods={topMods}
                    topModsToday={topModsToday}
                    defaultDevice={defaultDevice}
                />
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {    
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    const [latestMods] = await GetMods ({
        sort: 4,
        visible: true,
        userId: session?.user?.id,
        incDownloads: false,
        incSources: false,
        incInstallers: false
    })

    const [viewedMods] = await GetMods ({
        sort: 1,
        visible: true,
        userId: session?.user?.id,
        incDownloads: false,
        incSources: false,
        incInstallers: false
    })

    const [downloadedMods] = await GetMods ({
        sort: 2,
        visible: true,
        userId: session?.user?.id,
        incDownloads: false,
        incSources: false,
        incInstallers: false
    })

    const [topMods] = await GetMods ({
        visible: true,
        userId: session?.user?.id,
        incDownloads: false,
        incSources: false,
        incInstallers: false
    })

    // Retrieve time range for today.
    let todayDate = new Date(Date.now() - (86400 * 1000));

    todayDate = new Date(
        todayDate.getUTCFullYear(),
        todayDate.getUTCMonth(),
        todayDate.getUTCDate(),
        todayDate.getUTCHours(),
        todayDate.getUTCMinutes(),
        todayDate.getUTCSeconds(),
        todayDate.getUTCMilliseconds()
    )

    const [topModsToday] = await GetMods ({
        ratingTimeRange: todayDate,
        visible: true,
        userId: session?.user?.id,
        incDownloads: false,
        incSources: false,
        incInstallers: false
    })

    // Get default device type.
    const defaultDevice = GetDeviceType(ctx);

    return { 
        props: { 
            latestMods: JSON.parse(JSON.stringify(latestMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            viewedMods: JSON.parse(JSON.stringify(viewedMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            downloadedMods: JSON.parse(JSON.stringify(downloadedMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            topMods: JSON.parse(JSON.stringify(topMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            topModsToday: JSON.parse(JSON.stringify(topModsToday, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            defaultDevice: defaultDevice
        }
    }
}