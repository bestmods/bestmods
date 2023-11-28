import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { prisma } from "@server/db/client";

import { ModRowBrowser, ModRowBrowserSel } from "~/types/mod";
import ModCatalog from "@components/mod/catalog";

export default function Page ({
    latestMods = [],
    viewedMods = [],
    downloadedMods = []
} : {
    latestMods: ModRowBrowser[]
    viewedMods: ModRowBrowser[]
    downloadedMods: ModRowBrowser[]
}) {
    return (
        <>
            <MetaInfo />
            <Main>
                <ModCatalog
                    latestMods={latestMods}
                    viewedMods={viewedMods}
                    downloadedMods={downloadedMods}
                />
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const latestMods = await prisma.mod.findMany({
        take: 10,
        select: ModRowBrowserSel,
        orderBy: {
            createAt: "desc"
        }
    })

    const viewedMods = await prisma.mod.findMany({
        take: 10,
        select: ModRowBrowserSel,
        orderBy: {
            totalViews: "desc"
        }
    })

    const downloadedMods = await prisma.mod.findMany({
        take: 10,
        select: ModRowBrowserSel,
        orderBy: {
            totalDownloads: "desc"
        }
    })

    return { 
        props: { 
            latestMods: JSON.parse(JSON.stringify(latestMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            viewedMods: JSON.parse(JSON.stringify(viewedMods, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            downloadedMods: JSON.parse(JSON.stringify(downloadedMods, (_, v) => typeof v === "bigint" ? v.toString() : v))
        }
    }
}