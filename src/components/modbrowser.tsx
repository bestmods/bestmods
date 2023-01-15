import React, { useEffect, useState } from 'react';
import { trpc } from "../utils/trpc";

import { signIn, useSession } from "next-auth/react";

import { Mod, ModRating, ModSource, Source, Category } from "@prisma/client";

import InfiniteScroll from 'react-infinite-scroller';

type ModBrowserArguments = {
    search: string | null
    categories: Array<number> | null
};

type ModRowArguments = {
    mod: Mod
};

const ModSourceRender: React.FC<{mod: Mod, modSrc: ModSource}> = ({ mod, modSrc}) => {
    const srcQuery = trpc.source.getSource.useQuery({
        url: modSrc.sourceUrl
    });

    let name = "Placeholder";
    const url = "https://" + modSrc.sourceUrl + "/" + modSrc.query;

    if (srcQuery.data && srcQuery.isFetched)
        name = srcQuery.data.name;

    return (
        <li>
            <a href={url} className="block px-4 hover:bg-teal-900 text-white" target="_blank">{name}</a>
        </li>
    );
};

const ModRatingRender: React.FC<ModRowArguments> = ({ mod }) => {
    // Retrieve session.
    const { data: session } = useSession();

    // Retrieve rating.
    const [rating, setRating] = useState(1);
    const [ratingReceived, setRatingReceived] = useState(false);

    const ratingQuery = trpc.rating.getRatingsForMod.useQuery({
        url: mod.url,
        dateStart: null,
        dateEnd: null
    });

    if (ratingQuery.data && ratingQuery.isFetched && !ratingReceived) {
        let positives = 0;
        let negatives = 0;

        ratingQuery.data.map((r: ModRating) => {
            if (r.positive)
                positives++;
            else
                negatives++;
        });

        setRating((positives - negatives) + 1);
        setRatingReceived(true);
    }

    // Controls whether user rated this mod or not.
    const myRatingQuery = trpc.rating.getUserRatingForMod.useQuery({
        modId: mod.id,
        userId: session?.user?.id ?? ""
    });

    const [didRate, setDidRate] = useState(false);
    const [rateIsPositive, setRateIsPositive] = useState(false);

    if (myRatingQuery.data && myRatingQuery.isFetched && !didRate) {
        if (myRatingQuery.data.positive)
            setRateIsPositive(true);
        
        setDidRate(true);
    }

    const myRatingMut = trpc.rating.addUserRating.useMutation();

    return (
        <div className="relative w-3/5 flex text-center justify-center items-center">
            <div className="mr-1">
                <a href="#" onClick={(e) => {
                    e.preventDefault();

                    // Submit negative rating.
                    if (session?.user != null && !(didRate && !rateIsPositive)) {
                        myRatingMut.mutate({
                            userId: session.user.id,
                            modId: mod.id,
                            positive: false
                        });
                    } else
                        signIn("discord");
                }}><svg className={`w-12 h-12 text-center${ (didRate && rateIsPositive) ? " opacity-20" : ""}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11251)"><path d="M7 10L12 15" stroke="#FFA574" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15L17 10" stroke="#FFA574" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11251"><rect width="24" height="24" fill="white"/></clipPath></defs></svg></a>
            </div>
            <div className="text-center">
                <span className="text-white font-bold text-4xl">{rating}</span>
            </div>
            <div className="ml-1">
            <a href="#" onClick={(e) => {
                    e.preventDefault();

                    // Submit negative rating.
                    if (session?.user != null && !(didRate && !rateIsPositive)) {
                        myRatingMut.mutate({
                            userId: session.user.id,
                            modId: mod.id,
                            positive: true
                        });
                    } else
                        signIn("discord");
                }}><svg className={`w-12 h-12 text-center${ (didRate && !rateIsPositive) ? " opacity-20" : ""}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11224)"><path d="M17 14L12 9" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 9L7 14" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11224"><rect width="24" height="24" fill="white"/></clipPath></defs></svg></a>
            </div>
        </div>
    );
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
    const [sourcesMenuOpen, setSourcesMenuOpen] = useState(false);

    // Generate links.
    const viewLink = "/view/" + mod.url;

    // Generate classes.
    let addClasses = (cat != null && cat.classes != null) ? " " + cat.classes : "";

    // Generate installers.
    const installers: Array<{name: string, url: string}> = [{url: "moddingcommunity.com/launchMod.php?id=2", name: "Curseforge"}];
    const [installersMenuOpen, setInstallersMenuOpen] = useState(false);
    
    return (
        <div className={"w-72 max-w-72 h-[32rem] rounded bg-gradient-to-b from-cyan-500/30 to-cyan-800/30 flex flex-col shadow-lg" + addClasses}>
            <div className="modImage w-full max-h-64 h-64">
                <img className="w-full h-full max-h-full rounded-t" src={banner} />
            </div>
            <div className="mainInfo ml-8 mr-8 mb-4">
                    <h3 className="text-white text-xl font-bold text-center">{mod.name}</h3>
                    <p className="text-white mt-2 text-sm">{mod.description_short}</p>
                </div>
                {catPar != null && (
                    <div className="modCategory ml-8 mr-8 mb-1 text-white flex">
                        <img src={catParIcon} className="w-6 h-6 rounded"></img>
                        <span className="ml-2 mr-2">{catPar.name}</span>
                    </div>
                )}
                {cat != null && (
                    <div className="modCategory ml-8 mr-8 mb-1 text-white flex">
                        <img src={catIcon} className="w-6 h-6 rounded"></img>
                        <span className="ml-2">{cat.name}</span>
                    </div>
                )}
                <div className="grow"></div>
                <div className="modStats flex justify-between items-center">
                    <div className="relative ml-2 w-1/5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11085)"><path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12C3.60014 7.90264 7.33603 5 12 5C16.664 5 20.3999 7.90264 22 12C20.3999 16.0974 16.664 19 12 19C7.33603 19 3.60014 16.0974 2 12Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11085"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                        <span className="text-white text-sm ml-1">{mod.total_views.toString()}</span>
                    </div>

                    <ModRatingRender
                        mod={mod}
                    ></ModRatingRender>

                    <div className="relative mr-2 w-1/5 flex justify-end items-end flex-col">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11L12 15M12 15L8 11M12 15V3M21 15V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span className="text-white text-sm mr-1">{mod.total_downloads.toString()}</span>
                    </div>
                </div>
                <div className="modLinks justify-between flex text-center bg-cyan-900">
                    <a href={viewLink} className="text-white font-bold p-2 w-1/3">View</a>
                    {installers.length > 0 && (
                        <>
                            <div className="relative p-2 w-1/3">
                                <button id={"installerDropdownBtn" + mod.id} onClick={(e) => {
                                    setInstallersMenuOpen(!installersMenuOpen);
                                }} className="text-white font-bold flex items-center mx-auto" type="button"><span>Install</span> {!installersMenuOpen ? (
                                    <svg className="w-4 h-4 text-center ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11251)"><path d="M7 10L12 15" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15L17 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11251"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                                ) : (
                                    <svg className="w-4 h-4 text-center ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11224)"><path d="M17 14L12 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 9L7 14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11224"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                                )}</button>
            
                                <ul id={"installerDropdownMenu" + mod.id} className={`absolute py-1 text-sm bg-teal-800 ${ installersMenuOpen ? "block" : "hidden" }`} aria-labelledby={"installerDropdownBtn" + mod.id}>
                                    {installers.map((i) => {
                                        return (
                                            <li key={i.url}>
                                                <a href={i.url} className="block px-4 hover:bg-teal-900 text-white" target="_blank">{i.name}</a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </>
                    )}
                    {mod.ModSource != null && mod.ModSource.length > 0 && (
                        <div className="relative p-2 w-1/3">
                            <button id={"sourceDropdownBtn" + mod.id} onClick={(e) => {
                                setSourcesMenuOpen(!sourcesMenuOpen);
                            }} className="text-white font-bold flex items-center mx-auto" type="button"><span>Sources</span> {!sourcesMenuOpen ? (
                                <svg className="w-4 h-4 text-center ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11251)"><path d="M7 10L12 15" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15L17 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11251"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                            ) : (
                                <svg className="w-4 h-4 text-center ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11224)"><path d="M17 14L12 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 9L7 14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11224"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                            )}</button>
        
                            <ul id={"sourceDropdownMenu" + mod.id} className={`absolute py-1 text-sm bg-teal-800 ${ sourcesMenuOpen ? "block" : "hidden" }`} aria-labelledby={"installerDropdownBtn" + mod.id}>
                                {mod.ModSource.map((src: ModSource) => {
                                    return (
                                        <ModSourceRender
                                            key={mod.id + "-" + src.sourceUrl}
                                            mod={mod}
                                            modSrc={src}
                                        ></ModSourceRender>
                                    );
                                })}
                            </ul>
                        </div>
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
                        <ModRow
                            key={mod.id}
                            mod={mod}
                        ></ModRow>
                    );
                })}
            </div>
        </InfiniteScroll>
    );
};

export default ModBrowser;