import React, { useEffect, useState, useContext } from 'react';
import { trpc } from "../utils/trpc";

import { signIn } from "next-auth/react";

import { type Mod, type ModSource, type ModInstaller, type Category } from "@prisma/client";

import InfiniteScroll from 'react-infinite-scroller';

import { SessionCtx, FilterCtx, CfgCtx } from './main';

type ModRowArguments = {
    mod: any
};

const ModSourceRender: React.FC<{modSrc: ModSource}> = ({ modSrc}) => {
    const srcQuery = trpc.source.getSource.useQuery({
        url: modSrc.sourceUrl
    });

    let name = "Placeholder";
    const url = "https://" + modSrc.sourceUrl + "/" + modSrc.query;

    if (srcQuery.data && srcQuery.isFetched)
        name = srcQuery.data.name;

    return (
        <li>
            <a rel="noreferrer" href={url} className="block px-4 hover:bg-teal-900 text-white" target="_blank">{name}</a>
        </li>
    );
};

export const ModInstallerRender: React.FC<{modIns: ModInstaller}> = ({ modIns}) => {
    const srcQuery = trpc.source.getSource.useQuery({
        url: modIns.sourceUrl
    });

    let name = "Placeholder";
    const url = modIns.url;

    if (srcQuery.data && srcQuery.isFetched)
        name = srcQuery.data.name;

    return (
        <li>
            <a rel="noreferrer" href={url} className="block px-4 hover:bg-teal-900 text-white" target="_blank">{name}</a>
        </li>
    );
};

export const ModRatingRender: React.FC<ModRowArguments> = ({ mod }) => {
    // Retrieve session.
    const session = useContext(SessionCtx);
    const filters = useContext(FilterCtx);

    // Retrieve rating.
    const [rating, setRating] = useState(1);

    const modRequiresUpdateMut = trpc.mod.requireUpdate.useMutation();

    useEffect(() => {
        if (filters?.timeframe == null)
            return;

        switch (filters.timeframe) {
            case 0:
                setRating(mod.ratingHour);

                break;

            case 1:
                setRating(mod.ratingDay);

                break;

            case 2:
                setRating(mod.ratingWeek);

                break;

            case 3:
                setRating(mod.ratingMonth);

                break;

            case 4:
                setRating(mod.ratingYear);

                break;

            default:
                setRating(mod.totalRating);
        }
    }, [filters?.timeframe]);

    // Controls whether user rated this mod or not.
    const myRatingQuery = trpc.modRating.getModUserRating.useQuery({
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

    const myRatingMut = trpc.modRating.addModUserRating.useMutation();

    return (
        <div className="relative w-3/5 flex text-center justify-center items-center">
            <div className="mr-1">
                <a href="#" onClick={(e) => {
                    e.preventDefault();

                    // Submit negative rating.
                    if (session?.user != null) {
                        myRatingMut.mutate({
                            userId: session.user.id,
                            modId: mod.id,
                            positive: false
                        });

                        // Since we recalculate off of scheduling, set visible rating now.
                        const curRating = Number(rating);
                        setRating(curRating - 1);

                        // Require updating.
                        modRequiresUpdateMut.mutate({id: mod.id});

                        setDidRate(true);
                        setRateIsPositive(false);
                    } else if (session?.user == null)
                        signIn("discord");
                }}><svg className={`w-12 h-12 text-center${ (didRate && rateIsPositive) ? " opacity-20" : ""}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11251)"><path d="M7 10L12 15" stroke="#FFA574" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15L17 10" stroke="#FFA574" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11251"><rect width="24" height="24" fill="white"/></clipPath></defs></svg></a>
            </div>
            <div className="text-center">
                <span className="text-white font-bold text-4xl">{rating.toString()}</span>
            </div>
            <div className="ml-1">
            <a href="#" onClick={(e) => {
                    e.preventDefault();

                    // Submit positive rating.
                    if (session?.user != null) {
                        myRatingMut.mutate({
                            userId: session.user.id,
                            modId: mod.id,
                            positive: true
                        });

                        // Since we recalculate off of scheduling, set visible rating now.
                        const curRating = Number(rating);
                        setRating(curRating + 1);

                        // Require updating.
                        modRequiresUpdateMut.mutate({id: mod.id});

                        setDidRate(true);
                        setRateIsPositive(true);
                    } else if (session?.user == null) 
                        signIn("discord");
                }}><svg className={`w-12 h-12 text-center${ (didRate && !rateIsPositive) ? " opacity-20" : ""}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11224)"><path d="M17 14L12 9" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 9L7 14" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11224"><rect width="24" height="24" fill="white"/></clipPath></defs></svg></a>
            </div>
        </div>
    );
};

const ModRow: React.FC<ModRowArguments> = ({ mod }) => {
    // Retrieve config and CDN.
    const cfg = useContext(CfgCtx);

    let cdn = "";

    if (cfg && cfg.cdn)
        cdn = cfg.cdn;

    // Retrieve category.
    const cat: Category | null = mod.category;

    const catParentQuery = trpc.category.getCategory.useQuery({id: (cat != null && cat.parentId != null) ? cat.parentId : 0, url: null, parent: null});

    const catPar = catParentQuery.data;

    // Generate correct banner.   
    let banner = cdn + "/images/default_mod_banner.png";

    if (mod.banner != null && mod.banner.length > 0)
        banner = mod.banner;

    // Generate category info.
    const defaultCatIcon = cdn + "/images/default_icon.png";
    const catIcon = (cat != null && cat.icon != null) ? cdn + cat.icon : defaultCatIcon;
    const catParIcon = (catPar != null && catPar.icon !=  null) ? cdn + catPar.icon : defaultCatIcon;

    // Generating source info.
    const [sourcesMenuOpen, setSourcesMenuOpen] = useState(false);

    // Generate links.
    const viewLink = "/view/" + mod.url;

    const catParLink = (catPar != null) ? "/category/" + catPar.url : null;
    const catLink = ((cat != null) ? "/category" + ((catPar != null) ? "/" + catPar.url : "") + "/" + cat.url : null);

    // Generate classes.
    const addClasses = (cat != null && cat.classes != null) ? " " + cat.classes : "";

    // Generate installers.
    const [installersMenuOpen, setInstallersMenuOpen] = useState(false);
    
    return (
        <div key={mod.id} className={"w-4/5 md:w-96 h-[32rem] rounded bg-gradient-to-b from-cyan-800 to-cyan-900 flex flex-col shadow-lg" + addClasses}>
            <div className="relative modImage w-full max-h-64 h-64">
                <img className="w-full h-full max-h-full rounded-t" src={banner} alt="Mod Banner" />
                {mod.ownerName != null && (
                    <div className="absolute bottom-0 left-0 h-8 pr-4 rounded-tr bg-cyan-900/60 hover:bg-cyan-900 flex items-center">
                        <p className="text-white text-sm ml-1">{mod.ownerName}</p>
                    </div>
                )}

            </div>
            <div className="mainInfo ml-8 mr-8 mb-4 max-h-20 overflow-hidden text-ellipsis">
                    <h3 className="text-white text-xl font-bold text-center">{mod.name}</h3>
                    <p className="text-white mt-2 text-sm">{mod.descriptionShort}</p>
            </div>
            {catPar != null && (
                <div className="modCategory ml-8 mr-8 mb-1 text-white flex">
                    <img src={catParIcon} className="w-6 h-6 rounded" alt="Category Icon" />
                    <span className="ml-2 mr-2">
                        {catParLink != null ? (
                            <a href={catParLink}>{catPar.name}</a>
                        ) : (
                            <span>{catPar.name}</span>
                        )}
                    </span>
                </div>
            )}
            {cat != null && (
                <div className="modCategory ml-8 mr-8 mb-1 text-white flex">
                    <img src={catIcon} className="w-6 h-6 rounded" alt="Category Icon" />
                    <span className="ml-2">
                        {catLink != null ? (
                            <a href={catLink}>{cat.name}</a>
                        ) : (
                            <span>{cat.name}</span>
                        )}
                    </span>
                </div>
            )}
            <div className="grow"></div>
            <div className="modStats flex justify-between items-center">
                <div className="relative ml-2 w-1/5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11085)"><path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12C3.60014 7.90264 7.33603 5 12 5C16.664 5 20.3999 7.90264 22 12C20.3999 16.0974 16.664 19 12 19C7.33603 19 3.60014 16.0974 2 12Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11085"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                    <span className="text-white text-sm ml-1">{mod.totalViews.toString()}</span>
                </div>

                <ModRatingRender
                    mod={mod}
                />

                <div className="relative mr-2 w-1/5 flex justify-end items-end flex-col">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11L12 15M12 15L8 11M12 15V3M21 15V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-white text-sm mr-1">{mod.totalDownloads.toString()}</span>
                </div>
            </div>
            <div className="modLinks justify-between flex text-center bg-cyan-700 rounded-b">
                <a href={viewLink} className="text-white font-bold p-2 w-1/3">View</a>
                {mod.ModInstaller != null && mod.ModInstaller.length > 0 && (
                    <>
                        <div className="relative p-2 w-1/3">
                            <button id={"installerDropdownBtn" + mod.id} onClick={() => {
                                setInstallersMenuOpen(!installersMenuOpen);
                            }} className="text-white font-bold flex items-center mx-auto" type="button"><span>Install</span> {!installersMenuOpen ? (
                                <svg className="w-4 h-4 text-center ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11251)"><path d="M7 10L12 15" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15L17 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11251"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                            ) : (
                                <svg className="w-4 h-4 text-center ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11224)"><path d="M17 14L12 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 9L7 14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11224"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                            )}</button>
        
                            <ul id={"installerDropdownMenu" + mod.id} className={`absolute z-30 py-1 text-sm bg-cyan-800 ${ installersMenuOpen ? "block" : "hidden" }`} aria-labelledby={"installerDropdownBtn" + mod.id}>
                            {mod.ModInstaller.map((ins: ModInstaller) => {
                                return (
                                    <ModInstallerRender
                                        key={mod.id + "-" + ins.sourceUrl}
                                        modIns={ins}
                                    />
                                );
                            })}
                            </ul>
                        </div>
                    </>
                )}
                {mod.ModSource != null && mod.ModSource.length > 0 && (
                    <div className="relative p-2 w-1/3">
                        <button id={"sourceDropdownBtn" + mod.id} onClick={() => {
                            setSourcesMenuOpen(!sourcesMenuOpen);
                        }} className="text-white font-bold flex items-center mx-auto" type="button"><span>Sources</span> {!sourcesMenuOpen ? (
                            <svg className="w-4 h-4 text-center ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11251)"><path d="M7 10L12 15" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15L17 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11251"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                        ) : (
                            <svg className="w-4 h-4 text-center ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11224)"><path d="M17 14L12 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 9L7 14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11224"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                        )}</button>
    
                        <ul id={"sourceDropdownMenu" + mod.id} className={`absolute z-30 py-1 text-sm bg-cyan-800 ${ sourcesMenuOpen ? "block" : "hidden" }`} aria-labelledby={"installerDropdownBtn" + mod.id}>
                            {mod.ModSource.map((src: ModSource) => {
                                return (
                                    <ModSourceRender
                                        key={mod.id + "-" + src.sourceUrl}
                                        modSrc={src}
                                    />
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

const ModBrowser: React.FC<{categories?: Array<number> | null, visible?: boolean | null }> = ({ categories, visible }) => {
    const filters = useContext(FilterCtx);

    const [mods, setMods] = useState<Array<Mod>>([]);
    const [needMoreMods, setNeedMoreMods] = useState(true);
    const [modsVisible, setModsVisible] = useState(0);
    const [isFetching, setIsFetching] = useState(false);

    // Generate mods per page.
    let modsPerPage = Number(process.env.MODS_PER_PAGE);

    if (isNaN(modsPerPage))
        modsPerPage = 10;

    const modQuery = trpc.mod.getAllModsBrowser.useQuery({
        categories: ((categories != null) ? JSON.stringify(categories) : (filters?.categories != null ) ? JSON.stringify(filters.categories) : null),
        timeframe: filters?.timeframe ?? null,
        sort: filters?.sort ?? null,
        search: filters?.search ?? null,
        visible: (visible != null) ? visible : true,

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
    }, [isFetching, modQuery.data, modQuery.isFetched, modsPerPage, modsVisible]);

    useEffect(() => {
        setMods([]);
        setModsVisible(0);
        modQuery.refetch();

        setIsFetching(true);
        setNeedMoreMods(true);
    }, [filters?.categories, filters?.timeframe, filters?.sort, filters?.search]);

    const fetchMods = async () => {
        if (isFetching)
            return;

        modQuery.refetch();
        setIsFetching(true);
    };

    return (
        <div className="mx-auto w-full sm:w-4/5">
            <InfiniteScroll
                className="grid grid-cols-[repeat(auto-fill,minmax(theme(width.full),1fr))] sm:grid-cols-[repeat(auto-fill,minmax(theme(width.96),1fr))] justify-items-center gap-8"
                loadMore={fetchMods}
                hasMore={needMoreMods}
                loader={
                        <h3 key="loading" className="text-center text-white text-2xl">
                            <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                            <span>Loading...</span>
                        </h3>
                }
            >
                {mods.map(mod => {
                    return (
                        <ModRow
                            key={mod.id + "-row"}
                            mod={mod}
                        />
                    );
                })}
            </InfiniteScroll>
        </div>
    );
};

export default ModBrowser;