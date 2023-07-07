import { BestModsPage } from '../../components/main';

import { type NextPage } from "next";
import React, { useContext, useState } from "react";

import { trpc } from "../../utils/trpc";
import { type ModDownload } from '@prisma/client';

import ReactMarkdown from 'react-markdown'

import HeadInfo from "../../components/head";
import ModRatingRender from '../../components/mod/rating/render';

import { prisma } from '../../server/db/client';
import { type GetServerSidePropsContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import { Has_Perm } from '../../utils/permissions';
import Link from 'next/link';
import DropDown, { type Drop_Down_Menu_Type } from '../../components/utils/drop_down';

import Download2Icon from '../../components/utils/icons/download2';
import { Get_Mod_Rating } from '../../utils/content/mod';

const ModCtx = React.createContext<any | boolean | null>(null);
const ModViewCtx = React.createContext<string | null>(null);

const Home: NextPage<{
    mod: any,
    modView: string,
    rating: number
}> = ({
    mod,
    modView,
    rating
}) => {
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";

    // Handle background.
    let bg_file: string | undefined = undefined;
    
    if (mod) {
        if (mod.category.hasBg && mod.category.parent)
            bg_file = mod.category.parent.url + "_" + mod.category.url + ".png";
        else if (mod.category.hasBg && !mod.category.parent)
            bg_file = mod.category.url + ".png";
        else if (mod.category.parent && mod.category.parent.hasBg)
            bg_file = mod.category.parent.url + ".png";
    }

    const bg_path = "/images/backgrounds/" + bg_file;

    // Determine title name.
    let titleName = mod?.name ?? "";

    if (modView == "install")
        titleName += " (Installation)";
    else if (modView == "sources")
        titleName += " (Sources)";
    else if (modView == "downloads")
        titleName += " (Downloads)";
    else if (modView == "credits")
        titleName += " (Credits)";

    let cat_head_name = "";

    if (mod?.category?.parent)
        cat_head_name = mod.category.parent.name;
    else if (mod?.category)
        cat_head_name = mod.category.name;

    return (
        <>
            <ModCtx.Provider value={mod}>
                <ModViewCtx.Provider value={modView}>
                    <HeadInfo
                        title={mod ? titleName + " - " + cat_head_name + " - Best Mods" : null}
                        description={mod ? mod.descriptionShort : null}
                        image={mod && mod.banner ? cdn + mod.banner : null}
                        webtype="article"
                        author={(mod && mod.ownerName && mod.ownerName.length > 0) ? mod.ownerName : "Best Mods"}
                        excludeCdn={true}
                    />
                        <BestModsPage
                            image={bg_file ? cdn + bg_path : undefined}
                            excludeCdn={bg_file ? true : false}
                        >
                            <MainContent rating={rating} />
                        </BestModsPage>
                </ModViewCtx.Provider>
            </ModCtx.Provider>
        </>
    );
};

const MainContent: React.FC<{
    rating: number
}> = ({
    rating
}) => {
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";
    
    const mod = useContext(ModCtx);
    const modView = useContext(ModViewCtx);
    const { data: session } = useSession();

    // Mutations
    const mod_hide_mut = trpc.mod.setModVisibility.useMutation();
    const mod_del_mut = trpc.mod.delMod.useMutation();

    // We need to use a state for mod visibility (for moderation display right now).
    const [modVisibility, setModVisibility] = useState<boolean>(mod?.visible ?? true);

    const installer_items: Drop_Down_Menu_Type[] = [];

    if (mod != null) {
        // Compile installer drop-down items.
        if (mod.ModInstaller && mod.ModInstaller.length > 0) {
            mod.ModInstaller.map((ins: any) => {
                const name = ins.source.name;
                const url = ins.url;
    
                let icon = ins.source.icon ?? undefined;
    
                if (icon)
                    icon = cdn + icon;
    
                const html = <>
                    {icon && (
                        <img src={icon} />
                    )}
    
                    {name}
                </>;
    
                installer_items.push({
                    link: url,
                    html: html,
                    new_tab: false
                });
            });
        }

        // Determine our body.
        let body: JSX.Element = <></>;

        // Decide what content to serve.
        if (modView == "install")
            body = <ModInstall />;
        else if (modView == "sources")
            body = <ModSources cdn={cdn} />;
        else if (modView == "downloads")
            body = <ModDownloads />;
        else if (modView == "credits")
            body = <ModCredits />
        else
            body = <ModOverview />;

        // Generate image and link URLs.
        let banner = cdn + "/images/default_mod_banner.png";

        if (mod.banner)
            banner = cdn + mod.banner;

        const overviewLink = "/view/" + mod.url;
        const installLink = "/view/" + mod.url + "/install";
        const sourcesLink = "/view/" + mod.url + "/sources";
        const downloadsLink = "/view/" + mod.url + "/downloads";
        const credits_link = "/view/" + mod.url + "/credits";

        const editLink = "/admin/add/mod/" + mod.url;

        // Check rating.
        const onlyRating = ((mod.ModInstaller && mod.ModInstaller.length > 0) || (mod.ownerName && mod.ownerName.length > 0)) ? false : true;

        // Generate category icons and links.
        const defaultIcon = "/images/default_icon.png";
        const catIcon = (mod.category && mod.category.icon) ? cdn + mod.category.icon : cdn + defaultIcon;
        const catParIcon = (mod.category && mod.category.parent && mod.category.parent.icon) ? cdn + mod.category.parent.icon : cdn + defaultIcon;

        const catParLink = (mod.category && mod.category.parent) ? "/category/" + mod.category.parent.url : null;
        const catLink = ((mod.category) ? "/category" + ((mod.category.parent) ? "/" + mod.category.parent.url : "") + "/" + mod.category.url : null);

        return (
            <div id="mod-view">
                <div id="mod-header">
                    <div id="mod-image">
                        <img src={banner} alt="Mod Banner" />
                    </div>
                    <h1>{mod.name}</h1>
                    <div id="mod-categories">
                        {mod.category && (
                            <>
                                {mod.category.parent ? (
                                    <>
                                        <a href={catParLink ?? "/category"}>
                                            <img src={catParIcon} alt="Category Icon" />
                                            <span>{mod.category.parent.name ?? "Category"}</span>
                                        </a>
                                        <span> → </span>
                                        <a href={catLink ?? "/category"}>
                                            <img src={catIcon} alt="Category Icon" />
                                            <span>{mod.category.name ?? "Category"}</span>
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <a href={catLink ?? "/category"}>
                                            <img src={catIcon} alt="Category Icon" />
                                            <span>{mod.category.name ?? "Category"}</span>
                                        </a>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div id="mod-buttons">
                    <a href={overviewLink} className={`mod-button-item ${modView == "overview" ? "mod-button-item-active" : ""}`}>Overview</a>
                    <a href={installLink} className={`mod-button-item ${modView == "install" ? "mod-button-item-active" : ""}`}>Installation</a>
                    <a href={sourcesLink} className={`mod-button-item ${modView == "sources" ? "mod-button-item-active" : ""}`}>Sources</a>
                    <a href={downloadsLink} className={`mod-button-item ${modView == "downloads" ? "mod-button-item-active" : ""}`}>Downloads</a>
                    {mod?.ModCredit?.length > 0 && (
                        <a href={credits_link} className={`mod-button-item ${modView == "credits" ? "mod-button-item-active" : ""}`}>Credits</a>
                    )}
                </div>

                <div id="mod-content">
                    <div id="mod-content-top" className={`${onlyRating ? "justify-end" : "justify-between"}`}>
                        {mod.ownerName && mod.ownerName.length > 0 && (
                            <div id="mod-owner">
                                <p>Maintained By <span className="font-bold">{mod.ownerName}</span></p>
                            </div>
                        )}
                        {installer_items.length > 0 && (
                                <DropDown
                                    html={<>Install</>}
                                    drop_down_items={installer_items}
                                    classes={["mod-view-installer"]}
                                />
                        )}
                        <div className="relative flex justify-center">
                            <ModRatingRender
                                mod={mod}
                                rating={rating}
                            />
                        </div>
                    </div>
                    <div className="content-markdown">
                        {body}
                    </div>
                    {session && Has_Perm(session, "contributor") && (
                        <div className="mod-moderation">
                            <Link
                                className="btn btn-primary" 
                                href={editLink}
                            >Edit</Link>
                            <Link 
                                className="btn btn-secondary"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();

                                    // Do opposite of our current value.
                                    mod_hide_mut.mutate({
                                        id: mod.id,
                                        visible: !modVisibility
                                    });

                                    setModVisibility(!modVisibility);
                                }}
                            >{modVisibility ? "Hide" : "Show"}</Link>
                            <Link
                                className="btn btn-danger"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();

                                    // Delete mod after confirmation.
                                    if (confirm("Are you sure you want to delete this mod?")) {
                                        mod_del_mut.mutate({
                                            id: mod.id
                                        });
                                    }
                                }}
                            >Delete</Link>
                        </div>
                    )}
                </div>
            </div>
        );
    } else {
        return (
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-white text-center">Not Found</h1>
                <p className="text-white text-center">Mod not found. Please check the URL.</p>
            </div>
        );
    }
};

const ModOverview: React.FC = () => {
    const mod = useContext(ModCtx);


    return (
        <ReactMarkdown>
            {mod.description}
        </ReactMarkdown>
    );
};

const ModInstall: React.FC = () => {
    const mod = useContext(ModCtx);

    return (
        <ReactMarkdown>
            {mod.install ?? "<p>No installation guide found."}
        </ReactMarkdown>
    );
};

const ModSources: React.FC<{ cdn?: string }> = ({ cdn }) => {
    const mod = useContext(ModCtx);

    return (
        <>
            <h3>Sources</h3>
            {mod.ModSource != null && mod.ModSource.length > 0 && (
                <div id="mod-sources">
                    {mod.ModSource.map((src: any) => {
                        const name = src.source.name;
                        let banner = src.source.banner ? src.source.banner : "/images/default_source_banner.png";

                        if (cdn)
                            banner = cdn + banner;

                        const srcLink = "https://" + src.sourceUrl + "/" + src.query;

                        return (
                            <a rel="noreferrer" key={"src-" + src.modId + "-" + src.sourceUrl + "-" + src.query} href={srcLink} target="_blank" className="mod-source-item">
                                <div>
                                    <div className="mod-source-item-image">
                                        <img src={banner} alt="Source Banner" />
                                    </div>
                                    <div className="mod-source-item-name">
                                        <h3>{name}</h3>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}
        </>
    );
};

const ModDownloads: React.FC = () => {
    const mod = useContext(ModCtx);

    const modDownloadMut = trpc.modDownload.incModDownloadCnt.useMutation();

    const downloads = mod.ModDownload ?? [];

    const dlCnt: number = mod.totalDownloads ?? 0;

    return (
        <>
            <h3>Downloads</h3>
            <div id="mod-downloads">
                {downloads.map((dl: ModDownload) => {
                    return (
                        <a rel="noreferrer" key={mod.id + "-" + dl.url} onClick={() => {
                            modDownloadMut.mutate({
                                url: mod.url
                            });
                        }} className="mod-download-item" href={dl.url} target="_blank">
                            <div key={dl.modId + dl.url}>
                                <Download2Icon
                                    classes={["w-5", "h-5"]}
                                />
                                <span>{dl.name}</span>
                            </div>
                        </a>
                    );
                })}
            </div>
            <p className="mod-downloads-total">{dlCnt.toString()} Total Downloads</p>
        </>
    );
};

const ModCredits: React.FC = () => {
    const mod = useContext(ModCtx);

    const credits = mod.ModCredit ?? [];

    return (
        <>
            <h3>Credits</h3>
            <div id="mod-credits">
                <ul>
                    {credits.map(({ name, credit } : { name: string, credit: string }) => {
                        if (!name || !credit)
                            return;

                        return (
                            <li key={"credit-" + name}>
                                <span className="mod-credit-name">{name}</span> - <span className="mod-credit-credit">{credit}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const session = await getSession(ctx);

    // We need to retrieve some props.
    if (!ctx.params || !ctx.params.mod) {
        return {
            props: {
                mod: null,
                modView: "overview"
            }
        };
    }

    const url = ctx.params.mod[0] ?? "";
    const modView = ctx.params.mod[1] ?? "overview";

    const mod = await prisma.mod.findFirst({
        include: {
            category: {
                include: {
                    parent: true
                }
            },
            ModSource: {
                include: {
                    source: true
                }
            },
            ModDownload: true,
            ModInstaller: {
                include: {
                    source: true
                }
            },
            ModRating: {
                where: {
                    userId: session?.user?.id ?? ""
                }
            },
            ModCredit: true
        },
        where: {
            url: url
        }
    });

    let rating = 1;

    // Increment view if mod is found and retrieve mod rating.
    if (mod) {
        // Increment view count.
        await prisma.mod.update({
            where: {
                id: mod.id
            },
            data: {
                totalViews: {
                    increment: 1
                }
            }
        });

        // Retrieve mod rating.
        rating = await Get_Mod_Rating(prisma, mod.id);
    }

    return { 
        props: { 
            mod: JSON.parse(JSON.stringify(mod, (_, v) => typeof v === 'bigint' ? v.toString() : v)),
            rating: rating,
            modView: modView 
        } 
    };
}

export default Home;
