import React, { useState } from "react";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { prisma } from "@server/db/client";
import Link from "next/link";
import PlusIcon from "@components/icons/plus";
import MinusIcon from "@components/icons/minus";

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
                            <p className="leading-8"><Link href="/" className="font-bold">Best Mods</Link> is an index for game mods where users can browse and find mods from multiple sources on the Internet! Our goal is to allow users to discover all mods in one place.</p>

                            <p className="leading-8">With that said, we offer features to users such as the ability to upvote/downvote mods when signed in through <Link href="https://discord.com/" target="_blank">Discord</Link> along with in-depth filtering on our <Link href="/browse">browse page</Link>.</p>
                            
                            <p className="leading-8">This website is <Link href="https://github.com/bestmods/bestmods" target="_blank">open source</Link> and developed by <Link href="https://deaconn.net/user/view/cdeacon" target="_blank">Christian Deacon</Link>!</p>
                        </Section>
                        <Section
                            title="F.A.Q."
                            addStyling={false}
                        >
                            <div className="flex flex-col gap-2">
                                <FAQ
                                    question="How are mods and their details collected on this website?"
                                    answer={
                                        <>
                                            <p className="leading-8">Mods are currently added manually or through our web scraper. All details including download links are directed back to the website(s) where the mod originated from.</p>
                                            <p className="leading-8">The decision to use a web scraper is something we&apos;ve thought about for a long time given web scraping is generally frowned upon. However, after receiving feedback from multiple mod creators and the fact that we direct all download links back to the original source, we've decided to utilize a web scraper to give our users more mods to choose from. With that said, you may request a removal of your content. To do so, please read the <span className="font-bold">Can I remove my mods from this website</span> question below.</p>
                                        </>
                                    }
                                />
                                <FAQ
                                    question="Can I remove my mods from this website?"
                                    answer={
                                        <>
                                            <p className="leading-8">Of course! If you want your mods and content removed from Best Mods, you may file a request through our GitHub repository <Link href="https://github.com/orgs/bestmods/discussions/35" target="_blank">here</Link>. Alternatively, you may email us @ <Link href="mailto:bestmods.business@gmail.com" className="italic">bestmods.business@gmail.com</Link></p>
                                            <p className="leading-8">After verifying ownership of your content, we will remove your content from our website and ensure it isn't added again by our web scraper.</p>
                                        </>
                                    }
                                />
                                <FAQ
                                    question="My mod's information is outdated on this website, how can I get it updated?"
                                    answer={
                                        <>
                                            <p className="leading-8">Users who have the Contributor role or higher can edit each mod's details including images, description, installation, sources, download links, and more. We would recommend reaching out to a contributor or emailing us @  <Link href="mailto:bestmods.business@gmail.com" className="italic">bestmods.business@gmail.com</Link> to request an update.</p>
                                            <p className="leading-8">In the future, we plan to implement a change request form users may use to request an information update on specific mods.</p>
                                        </>
                                    }
                                />
                            </div>
                        </Section>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Section title="Stats">
                            <table className="table table-auto border-separate border-spacing-1">
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
    children,
    addStyling = true
} : {
    title?: string
    children: React.ReactNode
    addStyling?: boolean
}) {
    return (
        <div className="p-2 flex flex-col gap-2 break-words">
            {title && (
                <h2>{title}</h2>
            )}
            <div className={`${addStyling ? "bg-bestmods-2/80 ring-4 ring-bestmods-3 rounded shadow-lg shadow-black " : ""} p-2`}>
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
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="p-2 duration-500 bg-bestmods-2/80 ring-2 ring-bestmods-3 rounded shadow-sm shadow-black">
            <div
                className="cursor-pointer py-2 flex gap-2 items-center justify-between"
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
            >
                <span className="text-xl font-bold">{question}</span>
                <span>
                    {isOpen ? (
                        <MinusIcon className="w-6 h-6 fill-white" />
                    ) : (
                        <PlusIcon className="w-6 h-6 fill-white" />
                    )}
                    
                </span>
            </div>
            <div className={`text-sm ${isOpen ? "block" : "hidden"}`}>
                {typeof answer == "string" ? (
                    <p>{answer}</p>
                ) : (
                    <>{answer}</>
                )}
            </div>
        </div>
    )
}

export async function getServerSideProps() {
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