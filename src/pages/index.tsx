import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { type ModRowBrowser } from "~/types/mod";
import ModCatalog from "@components/mod/catalog";
import { GetMods } from "@utils/content/mod";
import { getServerAuthSession } from "@server/common/get-server-auth-session";

export default function Page ({
    latestMods = [],
    viewedMods = [],
    downloadedMods = [],
    topMods = [],
    topModsToday = []

} : {
    latestMods: ModRowBrowser[]
    viewedMods: ModRowBrowser[]
    downloadedMods: ModRowBrowser[]
    topMods: ModRowBrowser[]
    topModsToday: ModRowBrowser[]
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
        userId: session?.user?.id
    })

    const [viewedMods] = await GetMods ({
        sort: 1,
        userId: session?.user?.id
    })

    const [downloadedMods] = await GetMods ({
        sort: 2,
        userId: session?.user?.id
    })

    const [topMods] = await GetMods ({
        userId: session?.user?.id
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
        userId: session?.user?.id
    })

    return { 
        props: { 
            latestMods: JSON.parse(JSON.stringify(latestMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            viewedMods: JSON.parse(JSON.stringify(viewedMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            downloadedMods: JSON.parse(JSON.stringify(downloadedMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            topMods: JSON.parse(JSON.stringify(topMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            topModsToday: JSON.parse(JSON.stringify(topModsToday, (_, v) => typeof v === "bigint" ? v.toString() : v))
        }
    }
}