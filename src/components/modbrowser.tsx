import React, { useEffect, useState } from 'react';
import { trpc } from "../utils/trpc";

import { Mod, ModRating, Source, Category } from "@prisma/client";

import InfiniteScroll from 'react-infinite-scroller';

type ModBrowserArguments = {
    search: string | null
    categories: Array<number> | null
};

type ModRowArguments = {
    mod: Mod
};

const ModRow: React.FC<ModRowArguments> = ({ mod }) => {
    // Retrieve source.
    const srcUrl = (mod.ModSource != null && mod.ModSource.length > 0) ? mod.ModSource[0].sourceUrl : "";
    const srcQuery = trpc.source.getSource.useQuery({
        url: srcUrl
    });

    const src: Source | null = (srcQuery.data) ? srcQuery.data : null;

    // Retrieve category.
    const cat: Category | null = mod.category;

    const catParentQuery = trpc.category.getCategory.useQuery({id: (cat != null && cat.parentId != null) ? cat.parentId : 0});

    const catPar = catParentQuery.data;

    // Retrieve rating.
    let positives = 0;
    let negatives = 0;
    let rating = 1;

    const ratingQuery = trpc.rating.getRatingsForMod.useQuery({
        url: mod.url,
        dateStart: null,
        dateEnd: null
    });

    if (ratingQuery.data && ratingQuery.isFetched) {
        ratingQuery.data.map((r: ModRating) => {
            if (r.positive)
                positives++;
            else
                negatives++;
        });

        rating = (positives - negatives) + 1;
    }

    // Generate correct banner.   
    let banner = "/images/mod/default.png";

    if (src != null && src.banner != null)
        banner = src.banner;

    if (mod.banner != null && mod.banner.length > 0)
        banner = mod.banner;

    // Generate category info.
    const defaultCatIcon = "/images/source/default_icon.png";
    const catIcon = (cat != null && cat.icon != null) ? cat.icon : defaultCatIcon;
    const catParIcon = (catPar != null && catPar.icon !=  null) ? catPar.icon : defaultCatIcon;

    // Generating source info.
    const srcIcon = (src != null && src.icon != null) ? src.icon : "/images/source/default_icon.png";
    const srcLink = (src != null) ? "https://" + src.url : null;

    // Generate links.
    const viewLink = "/view/" + mod.url;
    const origLink = (src != null) ? "https://" + src.url + "/" + mod.ModSource[0].query : null;

    // Generate classes.
    let addClasses = (cat != null && cat.classes != null) ? " " + cat.classes : "";

    // Generate installers.
    const installers: Array<{name: string, url: string}> = [{url: "moddingcommunity.com/launchMod.php?id=2", name: "Curseforge"}];
    const [installersMenuOpen, setInstallersMenuOpen] = useState(false);
    
    return (
        <div className={"w-72 max-w-72 h-[32rem] rounded bg-gradient-to-b from-cyan-500/30 to-cyan-800/30 flex flex-col shadow-lg" + addClasses}>
            <div className="modImage w-full max-h-64 h-64">
                <img className="w-full h-full max-h-full" src={banner} />
            </div>
            <div className="mainInfo ml-8 mr-8 mb-4">
                    <h3 className="text-white text-xl font-bold text-center">{mod.name}</h3>
                    <p className="text-white mt-2 text-sm">{mod.description_short}</p>
                </div>
                <div className="modCategory ml-8 mr-8 mb-1">
                    <p className="text-white flex">
                        {catPar != null && (
                            <div className="flex">
                                {catParIcon != null && (
                                    <img src={catParIcon} className="w-6 h-6 rounded"></img>
                                )}

                                <span className="ml-2 mr-2">{catPar.name} -{'>'} </span>
                            </div>
                        )}
                        {cat != null && (
                            <div className="flex">
                                {catIcon != null && (
                                    <img src={catIcon} className="w-6 h-6 rounded"></img>
                                )}

                                <span className="ml-2">{cat.name}</span>
                            </div>
                        )}
                    </p>
                </div>
                {srcLink != null && src != null && (
                    <div className="modSource ml-8 mr-8">
                        <p className="text-white flex">
                            <img src={srcIcon} className="w-6 h-6" />
                            <a href={srcLink} className="ml-2 hover:underline" target="_blank">{src.name}</a>
                        </p>
                    </div>
                )}
                <div className="grow"></div>
                <div className="modStats">

                </div>
                <div className="modLinks justify-between flex text-center bg-cyan-900">
                    <a href={viewLink} className="text-white font-bold p-2 w-1/3">View</a>
                    {installers.length > 0 && (
                        <>
                            <div className="relative p-2 w-1/3">
                                <button id={"installerDropdownBtn" + mod.id}  onClick={(e) => {
                                    setInstallersMenuOpen(!installersMenuOpen);
                                }} className="text-white font-bold" type="button">Install <svg className="w-4 h-4 text-center ml-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button>
            
                                <ul id={"installerDropdownMenu" + mod.id} className={`absolute py-1 text-sm bg-teal-800 ${ installersMenuOpen ? "block" : "hidden" }`} aria-labelledby={"installerDropdownBtn" + mod.id}>
                                    {installers.map((i) => {
                                        return (
                                            <li>
                                                <a href={i.url} className="block px-4 hover:bg-teal-900 text-white" target="_blank">{i.name}</a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </>
                    )}
                    {origLink != null && (
                        <a href={origLink} target="_blank" className="text-white font-bold p-2 w-1/3 ">Original</a>
                    )}
                </div>
        </div>
    );
};

const ModBrowser: React.FC<ModBrowserArguments> = ({ search, categories }) => {
    const [mods, setMods] = useState<Array<Mod>>([]);
    const [needMoreMods, setNeedMoreMods] = useState(true);
    const [modsVisible, setModsVisible] = useState(0);
    const [isFetching, setIsFetching] = useState(false);

    let modsPerPage = Number(process.env.MODS_PER_PAGE);

    if (isNaN(modsPerPage))
        modsPerPage = 10;

    const modQuery = trpc.mod.getAllModsBrowser.useQuery({
        search: search,
        categories: JSON.stringify(categories) ?? null,

        offset: modsVisible,
        count: modsPerPage
    });

    useEffect(() => {
        if (!isFetching)
            return;

        if (modQuery.isFetched && modQuery.data && modQuery.data.length < 1) {
            setNeedMoreMods(false);
            setIsFetching(false);
        } else if (modQuery.isFetched && modQuery.data && modQuery.data.length > 0 ) {
            const curVisibleMods = modsVisible;

            // Set visible number.
            setModsVisible(curVisibleMods + modsPerPage);

            // Set our mods
            setMods([...mods, ...modQuery.data ?? []]);

            // We're no longer fetching.
            setIsFetching(false);
        }
    }, [isFetching, modQuery.data]);

    const fetchMods = async () => {
        if (isFetching)
            return;

        modQuery.refetch();
        setIsFetching(true);
    };

    return (
        <InfiniteScroll
            loadMore={fetchMods}
            hasMore={needMoreMods}
            loader={<div className="loadindicator">Loading...</div>}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {mods.map(mod => {
                    return (
                        <React.Fragment key={mod.id}>
                            <ModRow
                                mod={mod}
                            ></ModRow>
                        </React.Fragment>
                    );
                })}
            </div>
        </InfiniteScroll>
    );
};

export default ModBrowser;