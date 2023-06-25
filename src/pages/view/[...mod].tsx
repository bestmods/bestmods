import { BestModsPage, SessionCtx } from '../../components/main';

import { type NextPage } from "next";
import React, { useContext, useState, useEffect } from "react";

import { trpc } from "../../utils/trpc";
import { type ModSource, type ModDownload } from '@prisma/client';

import { marked } from 'marked';

import HeadInfo from "../../components/head";
import { ModInstallerRender, ModRatingRender } from '../../components/mod_browser';

import { prisma } from '../../server/db/client';
import { type GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';

const ModCtx = React.createContext<any | boolean | null>(null);
const ModViewCtx = React.createContext<string | null>(null);

const Home: NextPage<{ mod: any, modView: string }> = ({ mod, modView }) => {
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";

    // View generator.
    const [isViewed, setIsViewed] = useState(false);
    const modViewMut = trpc.modView.incModViewCnt.useMutation();

    if (!isViewed && mod && modView == "overview") {
        modViewMut.mutate({
            url: mod.url
        });

        setIsViewed(true);
    }

    // Handle background.
    let bg_file: string | undefined = undefined;
        
    if (mod.category.hasBg && mod.category.parent)
        bg_file = mod.category.parent.url + "_" + mod.category.url + ".png";
    else if (mod.category.hasBg && !mod.category.parent)
        bg_file = mod.category.url + ".png";
    else if (mod.category.parent && mod.category.parent.hasBg)
        bg_file = mod.category.parent.url + ".png";

    const bg_path = "/images/backgrounds/" + bg_file;

    // Determine title name.
    let titleName = mod.name;

    if (modView == "install")
        titleName += " (Installation)";
    else if (modView == "sources")
        titleName += " (Sources)";
    else if (modView == "downloads")
        titleName += " (Downloads)";

    return (
        <>
            <ModCtx.Provider value={mod}>
                <ModViewCtx.Provider value={modView}>
                    <HeadInfo
                        title={mod ? titleName + " - Best Mods" : null}
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
                            <MainContent 
                                cdn={cdn}
                            />
                        </BestModsPage>
                </ModViewCtx.Provider>
            </ModCtx.Provider>
        </>
    );
};

const MainContent: React.FC<{ 
    cdn: string
}> = ({ 
    cdn = "" 
}) => {
    const mod = useContext(ModCtx);
    const modView = useContext(ModViewCtx);
    const session = useContext(SessionCtx);

    // Installer menu.
    const [installersMenuOpen, setInstallersMenuOpen] = useState(false);

    if (mod != null) {
        let body: JSX.Element = <></>;

        // Generate classes for buttons and such.
        const btnBaseClasses = "!font-sm text-white font-bold rounded-t p-1 md:p-3 mr-1";
        const defaultStyle = "bg-cyan-900/50";
        const activeStyle = "font-bold bg-cyan-500/50";

        // Decide what content to serve.
        if (modView == "install")
            body = <ModInstall />;
        else if (modView == "sources")
            body = <ModSources cdn={cdn} />;
        else if (modView == "downloads")
            body = <ModDownloads />;
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
                </div>

                <div id="mod-content">
                    <div id="mod-content-top" className={`${onlyRating ? "justify-end" : "justify-between"}`}>
                        {mod.ownerName && mod.ownerName.length > 0 && (
                            <div id="mod-content-owner">
                                <p>Maintained By <span className="font-bold">{mod.ownerName}</span></p>
                            </div>
                        )}
                        {mod.ModInstaller && mod.ModInstaller.length > 0 && (
                            <div className="relative">
                                <div className="mod-installer">
                                    <button id="installerDropdownBtn" onClick={() => {
                                        setInstallersMenuOpen(!installersMenuOpen);
                                    }} type="button"><span>Install</span> {!installersMenuOpen ? (
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11251)"><path d="M7 10L12 15" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 15L17 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></g><defs><clipPath id="clip0_429_11251"><rect width="24" height="24" fill="white" /></clipPath></defs></svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11224)"><path d="M17 14L12 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9L7 14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></g><defs><clipPath id="clip0_429_11224"><rect width="24" height="24" fill="white" /></clipPath></defs></svg>
                                    )}</button>
                                </div>

                                <ul id="installerDropdownMenu" className={installersMenuOpen ? "block" : "hidden"} aria-labelledby="installerDropdownBtn">
                                    {mod.ModInstaller.map((ins: any) => {
                                        return (
                                            <ModInstallerRender
                                                key={mod.id + "-" + ins.sourceUrl}
                                                modIns={ins}
                                            />
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                        <div className="relative flex justify-center">
                            <ModRatingRender
                                mod={mod}
                            />
                        </div>
                    </div>
                    <div className="text-white" id="mod-description">
                        {body}
                    </div>
                    {session && (
                        <div className="flex flex-row justify-center items-center">
                            <a href={editLink} className="text-white bg-cyan-800 hover:bg-cyan-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded px-4 py-2 mt-2 max-w-xs">Edit</a>
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
    const data = marked(mod?.description ?? "");

    return (
        <>
            <div dangerouslySetInnerHTML={{ __html: data }} />
        </>
    );
};

const ModInstall: React.FC = () => {
    const mod = useContext(ModCtx);
    const data = (mod.install != null) ? marked(mod.install ?? "") : "<p>No installation guide found.</p>";

    return (
        <>
            <div dangerouslySetInnerHTML={{ __html: data }} />
        </>
    );
};

const ModSources: React.FC<{ cdn?: string }> = ({ cdn }) => {
    const mod = useContext(ModCtx);

    return (
        <>
            <h3>Sources</h3>
            {mod.ModSource != null && mod.ModSource.length > 0 && (
                <div id="mod-sources">
                    {mod.ModSource.map((src: ModSource) => {
                        const srcQuery = trpc.source.getSource.useQuery({
                            url: src.sourceUrl,

                            selName: true,
                            selBanner: true
                        });

                        const srcDirect = srcQuery.data;

                        let name = "Placeholder";
                        let banner = "/images/default_source_banner.png";

                        if (srcDirect) {
                            name = srcDirect.name;

                            if (srcDirect.banner)
                                banner = srcDirect.banner;
                        }

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
                                <svg className="w-5 h-5" viewBox="0 0 512 512" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z" /></svg>
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
            ModSource: true,
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
            }
        },
        where: {
            url: url
        }
    });

    return { 
        props: { 
            mod: JSON.parse(JSON.stringify(mod, (_, v) => typeof v === 'bigint' ? v.toString() : v)),
            modView: modView 
        } 
    };
}

export default Home;
