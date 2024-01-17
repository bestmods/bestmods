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
            />
            <Main>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 flex flex-col gap-4">
                        <Section title="About">
                            <p>We are a global index for game mods where users can browse and find mods from multiple sources on the Internet! Our goal is to allow users to discover all mods in one place along with follow a standard and clean template for mod data including its description, installation, and more.</p>

                            <p>With that said, we offer features to users such as the ability to upvote/downvote mods when signed in through <Link href="https://discord.com/" target="_blank">Discord</Link> along with in-depth filtering on our <Link href="/browse">browse page</Link>.</p>
                            
                            <p>This website is <Link href="https://github.com/bestmods/bestmods" target="_blank">open source</Link> and developed by <Link href="https://deaconn.net/user/view/cdeacon" target="_blank">Christian Deacon</Link>!</p>
                        </Section>
                        <Section
                            title="F.A.Q."
                            addStyling={false}
                        >
                            <div className="flex flex-col gap-2">
                                <FAQ
                                    question="How are mods collected?"
                                    answer={
                                        <>
                                            <p>Mods are currently collected and added manually or through our private web scraper. Generally, all links such as downloads are directed back to the website(s) where the mod originated from.</p>
                                            <p>The decision to use a web scraper is something we{"'"}ve thought about for close to a year given web scraping is generally frowned upon. However, after receiving feedback from multiple mod creators and the fact that we direct all download links back to the original source, we{"'"}ve decided to create and utilize a web scraper to give our users more mods to choose from. With that said, if you do not want your mods or sources listed on our website, you may request a removal of your content. To do so, please read the <span className="font-bold">I do not want my mods or sources listed on this website. Can I remove them?</span> question below.</p>
                                            <p>Our web scraper is current private and closed-source. This is to protect code that parses and extracts data of mods from other websites and prevent users from using the code for malicious purposes. There is a slight chance we make the code open source in the future, but <span className="font-bold">only</span> for extracting and parsing data from our website itself.</p>
                                        </>
                                    }
                                />
                                <FAQ
                                    question="What mod data do you collect and/or store?"
                                    answer={
                                        <>
                                            <p>We currently collect the following mod data.</p>
                                            <ul className="list-generic">
                                                <li>Title/name.</li>
                                                <li>An image that represents the banner; Sometimes the mod{"'"}s first screenshot if no other image is found (stored locally on our server).</li>
                                                <li>A short and long description (the long description is converted from HTML to Markdown syntax and represented that way).</li>
                                                <li>The owner{"'"}s name, if any.</li>
                                                <li>An installation guide (converted from HTML to Markdown syntax and represented that way).</li>
                                                <li>The current version, if any.</li>
                                                <li>A NSFW flag, if the mod is marked as NSFW.</li>
                                                <li>Sources from other websites (where the mod originated from).</li>
                                                <li>Download links to other websites along with the file{"'"}s size and upload date, if any.</li>
                                                <li>Screenshot URLs from other websites.</li>
                                                <li>A list of users who are credited, if any.</li>
                                            </ul>
                                            <p>Additionally, our private web scraper tries to find the most accurate information for each mod. However, it isn{"'"}t perfect and doesn{"'"}t include any AI-integration. Therefore, there are times where the mod{"'"}s data will be incorrect. In this case, a contributor or admin will need to update the information. Please read the <span className="font-bold">A mod{"'"}s information is outdated. How can I get it updated?</span> question below for more information.</p>
                                        </>
                                    }
                                />
                                <FAQ
                                    question="What user data do you store?"
                                    answer={
                                        <>
                                            <p>We try to store as little user data as possible due to the website{"'"}s source code being open source. While we are confident in our website{"'"}s security, no application or website is fully bullet-proof from being data breached. Therefore, we try to store as little information as possible</p>
                                            <p>With that said, the following data is stored in our application{"'"}s database if you sign in through Discord.</p>
                                            <ul className="list-generic">
                                                <li>Discord username.</li>
                                                <li>Email associated with the Discord account.</li>
                                                <li>A URL to the Discord avatar (becomes invalid if the user changes their avatar).</li>
                                                <li>Session/access tokens specifically to <span className="font-bold">our website</span>.</li>
                                            </ul>
                                        </>
                                    }
                                />
                                <FAQ
                                    question="Can I have my account removed?"
                                    answer={
                                        <>
                                            <p>Yes. If you would like your account removed, please reach out to an administrator or email us at <EmailLink />!</p>
                                            <p>In the future, we will consider adding the option for users to delete their account(s) manually.</p>
                                        </>
                                    }
                                />
                                <FAQ
                                    question="I do not want my mods or sources listed. Can I remove them?"
                                    answer={
                                        <>
                                            <p>Of course! If you want your mod(s) and content removed from our website, you may file a request through our GitHub repository <Link href="https://github.com/orgs/bestmods/discussions/35" target="_blank">here</Link>. Alternatively, you may email us at <EmailLink /> or reach out to a contributor or admin directly.</p>
                                            <p>After verifying ownership of your content, we will remove your content from our website and ensure it isn{"'"}t added again by our web scraper.</p>
                                        </>
                                    }
                                />
                                <FAQ
                                    question="A mod's information is outdated. How can I get it updated?"
                                    answer={
                                        <>
                                            <p>Users who are a contributor or admin can edit mod data including banner/screenshots, description, installation, sources, version, download links, and more. We would recommend reaching out to a contributor or admin directly, or emailing us at <EmailLink /> to request an update.</p>
                                            <p>In the future, we plan to implement a change request form users may use to request an information update on mod(s).</p>
                                        </>
                                    }
                                />
                                <FAQ
                                    question="How is NSFW content handled?"
                                    answer={
                                        <>
                                            <p>A mod can be flagged as NSFW (<span className="font-bold">Not Suitable For Work</span>). When this happens, the mod{"'"}s banner and screenshots are blurred out until the user clicks the <span className="font-bold">View</span> button in the middle of the image.</p>
                                            <p>Our private web scraper tries to determine if the mod is NSFW automatically. However, if it can{"'"}t, a contributor or admin will need to mark it as NSFW manually. If you find a mod that is NSFW, but not flagged, you may use the <span className="font-bold">Report</span> button on the mod view{"'"}s view page to send a request to contributors and admins. Otherwise, you may reach out to a contributor or admin directly or email us at <EmailLink />!</p>
                                            <p>In the future, we will consider adding AI-integration to scan each image for NSFW content automatically. However, we will require more server resources for this when the time comes.</p>
                                        </>
                                    }
                                />
                                <FAQ
                                    question="Will you allow reviews or comments in the future?"
                                    answer={
                                        <>
                                            <p>At this time, there are no plans to implement mod reviews or comments. There are a few reasons for this which are described below.</p>
                                            <p>Firstly, we want as little moderation as possible on our end. Allowing comments and reviews will heavily increase the need for moderation and additional security implementations.</p>
                                            <p>Secondly, there is a high chance the mod{"'"}s author(s) aren{"'"}t aware of the mod being listed on our website. Therefore, it isn{"'"}t fair for others to write reviews and comments when the author(s) aren{"'"}t aware.</p>
                                            <p>Lastly, we would prefer users going to the websites where the mod originated to write reviews/comments since the source should be receiving that traffic.</p>
                                        </>
                                    }
                                />
                                <FAQ
                                    question="Will ads be ran on this website in the future?"
                                    answer={
                                        <>
                                            <p>At the time, there are no advertisements ran on our website. However, there is a high chance this will change in the future.</p>
                                            <p>This has been another topic we{"'"}ve thought long and hard about, especially with the website being open source. After finishing our web scraper and having over a thousand mods added to the website, it became clear we will need more server resources and disk space in the future which will raise the server cost. Therefore, we will be running paid advertisements in the future to receive revenue for server{"'"}s cost.</p>
                                        </>
                                    }
                                />
                                <FAQ
                                    question="Can I help with this project?"
                                    answer={
                                        <>
                                            <p>We are always looking for help on the project! To help out, you can either reach out to us about becoming a contributor or help implement features into the website. Otherwise, we are open to suggestions and feedback!</p>
                                            <p>Currently, the website is being solely developed by <Link href="https://deaconn.net/user/view/cdeacon" target="_blank">Christian Deacon</Link>.</p>
                                            <p>If you would like to help out, please reach out to an admin directly or email us at <EmailLink />!</p>
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

export function EmailLink() {
    return (
        <Link href="mailto:bestmods.business@gmail.com" className="italic">bestmods.business@gmail.com</Link>
    )
}