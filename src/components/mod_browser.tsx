import React, { useEffect, useState, useContext } from 'react';
import { trpc } from "../utils/trpc";

import { signIn } from "next-auth/react";

import { type ModSource, type ModInstaller, type Category } from "@prisma/client";

import InfiniteScroll from 'react-infinite-scroller';

import { SessionCtx, FilterCtx, CookiesCtx } from './main';
import GridRow from './modbrowser/grid_row';
import TableRow from './modbrowser/table_row';

type ModRowArguments = {
    mod: any
    display?: string
};

export const ModSourceRender: React.FC<{
    modSrc: ModSource
}> = ({
    modSrc
}) => {
    const srcQuery = trpc.source.getSource.useQuery({
        url: modSrc.sourceUrl,

        selName: true
    });
    const src = srcQuery.data;

    let name = "Placeholder";
    const url = "https://" + modSrc.sourceUrl + "/" + modSrc.query;

    if (src)
        name = src.name;

    return (
        <li>
            <a rel="noreferrer" href={url} className="block px-4 hover:bg-teal-900 text-white" target="_blank">{name}</a>
        </li>
    );
};

export const ModInstallerRender: React.FC<{
    modIns: ModInstaller
}> = ({
    modIns
}) => {
    const srcQuery = trpc.source.getSource.useQuery({
        url: modIns.sourceUrl,

        selName: true
    });
    const src = srcQuery.data;

    let name = "Placeholder";
    const url = modIns.url;

    if (src)
        name = src.name;

    return (
        <li>
            <a rel="noreferrer" href={url} className="block px-4 hover:bg-teal-900 text-white">{name}</a>
        </li>
    );
};

export const ModRatingRender: React.FC<ModRowArguments> = ({
    mod
}) => {
    // Retrieve session.
    const session = useContext(SessionCtx);
    const filters = useContext(FilterCtx);

    // Retrieve rating.
    const [rating, setRating] = useState(1);
    const [receivedRating, setReceivedRating] = useState(false);

    const modRequiresUpdateMut = trpc.mod.requireUpdate.useMutation();

    if (filters?.timeframe && !receivedRating) {
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

        setReceivedRating(true);
    }

    // Controls whether user rated this mod or not.
    const myRatingQuery = trpc.modRating.getModUserRating.useQuery({
        modId: mod.id,
        userId: session?.user?.id ?? null
    });

    const [didRate, setDidRate] = useState(false);
    const [rateIsPositive, setRateIsPositive] = useState(false);

    if (myRatingQuery.data && !didRate) {
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
                        if (didRate && !rateIsPositive)
                            return;

                        myRatingMut.mutate({
                            userId: session.user.id,
                            modId: mod.id,
                            positive: false
                        });

                        // Since we recalculate off of scheduling, set visible rating now.
                        const curRating = Number(rating);
                        setRating(curRating - 1);

                        // Require updating.
                        modRequiresUpdateMut.mutate({ id: mod.id });

                        setDidRate(true);
                        setRateIsPositive(false);
                    } else if (session?.user == null)
                        signIn("discord");
                }}><svg className={`w-12 h-12 text-center${(didRate && rateIsPositive) ? " opacity-20" : ""}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11251)"><path d="M7 10L12 15" stroke="#FFA574" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 15L17 10" stroke="#FFA574" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></g><defs><clipPath id="clip0_429_11251"><rect width="24" height="24" fill="white" /></clipPath></defs></svg></a>
            </div>
            <div className="text-center">
                <span className="text-white font-bold text-4xl">{rating.toString()}</span>
            </div>
            <div className="ml-1">
                <a href="#" onClick={(e) => {
                    e.preventDefault();

                    // Submit positive rating.
                    if (session?.user != null) {
                        if (didRate && rateIsPositive)
                            return;

                        myRatingMut.mutate({
                            userId: session.user.id,
                            modId: mod.id,
                            positive: true
                        });

                        // Since we recalculate off of scheduling, set visible rating now.
                        const curRating = Number(rating);
                        setRating(curRating + 1);

                        // Require updating.
                        modRequiresUpdateMut.mutate({ id: mod.id });

                        setDidRate(true);
                        setRateIsPositive(true);
                    } else if (!session?.user)
                        signIn("discord");
                }}><svg className={`w-12 h-12 text-center${(didRate && !rateIsPositive) ? " opacity-20" : ""}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11224)"><path d="M17 14L12 9" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9L7 14" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></g><defs><clipPath id="clip0_429_11224"><rect width="24" height="24" fill="white" /></clipPath></defs></svg></a>
            </div>
        </div>
    );
};

const ModRow: React.FC<ModRowArguments> = ({
    mod,
    display = "grid"
}) => {
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";

    // Retrieve category.
    const cat: Category | null = mod.category;

    const catParentQuery = trpc.category.getCategory.useQuery({
        id: (cat != null && cat.parentId != null) ? cat.parentId : null,

        selId: true,
        selUrl: true,
        selIcon: true,
        selName: true
    });

    const catPar = catParentQuery.data;

    // Generate correct banner.   
    let banner = cdn + "/images/default_mod_banner.png";

    if (mod.banner != null && mod.banner.length > 0)
        banner = cdn + mod.banner;

    // Generate category info.
    const defaultCatIcon = cdn + "/images/default_icon.png";
    const catIcon = (cat != null && cat.icon != null) ? cdn + cat.icon : defaultCatIcon;
    const catParIcon = (catPar && catPar.icon) ? cdn + catPar.icon : defaultCatIcon;

    // Generate links.
    const viewLink = "/view/" + mod.url;

    const catParLink = (catPar) ? "/category/" + catPar.url : null;
    const catLink = ((cat) ? "/category" + ((catPar) ? "/" + catPar.url : "") + "/" + cat.url : null);

    // Generate classes.
    const addClasses = (cat && cat.classes) ? " " + cat.classes : "";

    // Handle short description.
    const descShort = String(mod.descriptionShort);
    const dots = (descShort.length > 120) ? "..." : "";

    return (
        <>
            {display == "grid" ? (
                <GridRow
                    mod={mod}
                    addClasses={addClasses}
                    banner={banner}
                    descShort={descShort}
                    dots={dots}
                    cat={cat}
                    catIcon={catIcon}
                    catLink={catLink}
                    catPar={catPar}
                    catParIcon={catParIcon}
                    catParLink={catParLink}
                    viewLink={viewLink}
                />
            ) : (
                <TableRow
                    mod={mod}
                    addClasses={addClasses}
                    banner={banner}
                    descShort={descShort}
                    dots={dots}
                    cat={cat}
                    catIcon={catIcon}
                    catLink={catLink}
                    catPar={catPar}
                    catParIcon={catParIcon}
                    catParLink={catParLink}
                    viewLink={viewLink}
                />
            )}
        </>
    );
};

const ModBrowser: React.FC<{
    categories?: Array<number> | null,
    visible?: boolean | null
}> = ({
    categories,
    visible
}) => {
    const filters = useContext(FilterCtx);

    let requireItems = true;
    const items: any = [];
    const itemsPerLoad = 10;

    const { data, fetchNextPage } = trpc.mod.getAllModsBrowser.useInfiniteQuery({
        count: itemsPerLoad,

        categories: (categories) ? JSON.stringify(categories) : null,
        timeframe: filters?.timeframe ?? null,
        sort: filters?.sort ?? null,
        search: filters?.search ?? null,
        visible: (visible != null) ? visible : true,

        selId: true,
        selName: true,
        selUrl: true,
        selOwnerName: true,
        selDescriptionShort: true,

        selBanner: true,

        selTotalDownloads: true,
        selTotalViews: true,
        selTotalRating: true,

        selRatingHour: true,
        selRatingDay: true,
        selRatingWeek: true,
        selRatingMonth: true,
        selRatingYear: true,

        incCategory: true,
        incSources: true,
        incInstallers: true
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCur,
    });

    const loadMore = () => {
        fetchNextPage();
    };

    if (data) {
        data.pages.forEach((pg) => {
            items.push(...pg.items);
            
            // If next cursor is undefined, we're at the end.
            if (!pg.nextCur)
                requireItems = false;
        });
    }

    // Figure out which display.
    let display = "grid";
    const cookies = useContext(CookiesCtx);

    if (cookies && cookies['bm_display'] != undefined && cookies['bm_display'] != "grid")
        display = "table";

    return (
        <div className="mx-auto w-full sm:w-4/5">
            <InfiniteScroll
                pageStart={0}
                className={display + `View${(items.length < 1) ? " !grid-cols-1 sm:!grid-cols-1" : ""}`}
                loadMore={loadMore}
                hasMore={requireItems}
                loader={
                    <h3 key="loading" className="text-center text-white text-2xl">
                        <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                        <span>Loading...</span>
                    </h3>
                }
            >
                {display == "grid" ? (
                    <>
                        {items.length > 0 ? (
                            <>
                                {items.map((mod: any) => {
                                    return (
                                        <ModRow
                                            key={mod.id + "-row"}
                                            mod={mod}
                                            display={display}
                                        />
                                    );
                                })}
                            </>
                        ) : (
                            <>
                                {!requireItems && (
                                    <p className="mods-not-found">No mods found.</p>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {items.length > 0 ? (
                            <table className="modbrowser-table">
                                <tbody>
                                    {items.map((mod: any) => {
                                        return (
                                            <ModRow
                                                key={mod.id + "-row"}
                                                mod={mod}
                                                display={display}
                                            />
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <>
                                {!requireItems && (
                                    <p className="mods-not-found">No mods found.</p>
                                )}
                            </>
                        )}
                    </>
                )}
            </InfiniteScroll>
        </div>
    );
};

export default ModBrowser;