import React from "react";
import { type GetServerSidePropsContext } from "next";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { prisma } from "@server/db/client";
import Link from "next/link";

type siteStats = {
    modCnt: number
    gameCnt: number
    catCnt: number
    srcCnt: number
    userCnt: number
}

export default function Page ({
    stats
} : {
    stats: siteStats
}) {
    const { modCnt, gameCnt, catCnt, srcCnt, userCnt } = stats;

    return (
        <>
            <MetaInfo
                title="About - Best Mods"
                description="About Best Mods!"
            />
            <Main>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 flex flex-col gap-4">
                        <Section title="About">
                            <p><Link href="/"  className="font-bold">Best Mods</Link> is an <Link href="https://github.com/bestmods/bestmods" target="_blank">open source</Link> website developed by <Link href="https://github.com/gamemann" target="_blank">Christian Deacon</Link> that acts as a global index for game mods. Our main goal is to allow users to discover mods in one place. With that being said, all download links direct back to the mod's origin. We do not store</p>
                        </Section>
                        <Section title="F.A.Q.">
                            <FAQ
                                question="How do I request a removal of my mods?"
                                answer={
                                    <p>If you want your mods and content to be removed from Best Mods, you may file a request through our GitHub repository <Link href="https://github.com/orgs/bestmods/discussions/35" target="_blank">here</Link>. Alternatively, you may email us @ <Link href="mailto:bestmods.business@gmail.com" className="italic">bestmods.business@gmail.com</Link></p>
                                }
                            />
                        </Section>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Section title="Stats">
                            <table className="table table-auto border-separate border-spacing-2">
                                <tbody>
                                    <Stat label="Mods" value={modCnt} />
                                    <Stat label="Games" value={gameCnt} />
                                    <Stat label="Categories" value={catCnt} />
                                    <Stat label="Sources" value={srcCnt} />
                                    <Stat label="Users" value={userCnt} />
                                </tbody>
                            </table>
                        </Section>
                    </div>
                </div>
            </Main>
        </>
    )
}

function Section ({
    title,
    children
} : {
    title?: string
    children: React.ReactNode
}) {
    return (
        <div className="p-2 bg-bestmods-2/80 rounded shadow-lg shadow-black break-words">
            {title && (
                <h2>{title}</h2>
            )}
            <div className="p-2">
                {children}
            </div>
        </div>
    )
}

function Stat ({
    label,
    value
} : {
    label: string
    value: number
}) {
    return (
        <tr>
            <td>
                <span className="font-bold">{value.toString()}</span>
            </td>
            <td>
                <span>{label}</span>
            </td>
        </tr>
    )
}

function FAQ ({
    question,
    answer
} : {
    question: string
    answer: string | JSX.Element
}) {
    return (
        <div className="p-2">
            <p className="font-bold">{question}</p>
            <div>
                {typeof answer == "string" ? (
                    <p>{answer}</p>
                ) : (
                    <>{answer}</>
                )}
            </div>
        </div>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const modCnt = await prisma.mod.count({
        where: {
            visible: true
        }
    });

    const gameCnt = await prisma.category.count({
        where: {
            parent: null
        }
    });

    const catCnt = await prisma.category.count();
    const srcCnt = await prisma.source.count();
    const userCnt = await prisma.user.count();

    const stats: siteStats = {
        modCnt: modCnt,
        gameCnt: gameCnt,
        catCnt: catCnt,
        srcCnt: srcCnt,
        userCnt: userCnt
    }
    
    return { 
        props: { 
            stats: stats
        }
    }
}