import React, { useState, useContext } from 'react';
import { trpc } from "../utils/trpc";

import { signIn, useSession } from "next-auth/react";

import InfiniteScroll from 'react-infinite-scroller';

import { FilterCtx, CookiesCtx } from './main';
import GridRow from './modbrowser/grid_row';
import TableRow from './modbrowser/table_row';

import LoadingIcon from './utils/icons/loading';

import UpArrow2 from './utils/icons/up_arrow2';
import DownArrow2 from './utils/icons/down_arrow2';

type ModRowArguments = {
    mod: any
    display?: string
};

export const ModRatingRender: React.FC<ModRowArguments> = ({
    mod
}) => {
    // Retrieve session.
    const { data: session } = useSession();
    const filters = useContext(FilterCtx);

    // Retrieve rating.
    const cur_rating = mod.ModRating[0] ?? null;

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

            case 5:
                setRating(mod.totalRating);

            default:
                setRating(mod.ratingHour);
        }

        setReceivedRating(true);
    }

    // Controls whether user rated this mod or not.
    const [didRate, setDidRate] = useState(false);
    const [rateIsPositive, setRateIsPositive] = useState(false);

    if (cur_rating && !didRate) {
        if (cur_rating.positive)
            setRateIsPositive(true);

        setDidRate(true);
    }

    const myRatingMut = trpc.modRating.addModUserRating.useMutation();

    // Arrow classes.
    const classes_up = ["w-12", "h-12", "text-center"];
    const classes_down = ["w-12", "h-12", "text-center"];

    if (didRate) {
        if (rateIsPositive)
            classes_down.push("opacity-20");
        else
            classes_up.push("opacity-20");
    }

    return (
        <div className="relative w-3/5 flex text-center justify-center items-center">
            <div className="mr-1">
                <a href="#" onClick={(e) => {
                    e.preventDefault();

                    // Submit negative rating.
                    if (session?.user) {
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
                }}>
                    <DownArrow2
                        classes={classes_down}
                    />
                </a>
            </div>
            <div className="text-center">
                <span className="text-white font-bold text-4xl">{rating.toString()}</span>
            </div>
            <div className="ml-1">
                <a href="#" onClick={(e) => {
                    e.preventDefault();

                    // Submit positive rating.
                    if (session?.user) {
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
                }}>
                    <UpArrow2
                        classes={classes_up}
                    />
                </a>
            </div>
        </div>
    );
};

const ModRow: React.FC<ModRowArguments> = ({
    mod,
    display = "grid"
}) => {
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";

    // Generate correct banner.   
    let banner = cdn + "/images/default_mod_banner.png";

    if (mod.banner && mod.banner.length > 0)
        banner = cdn + mod.banner;

    // Categories.
    const cat = mod.category;
    const cat_par = cat.parent;

    // Generate category info.
    const defaultCatIcon = cdn + "/images/default_icon.png";
    const catIcon = (cat && cat.icon) ? cdn + cat.icon : defaultCatIcon;
    const catParIcon = (cat_par && cat_par.icon) ? cdn + cat_par.icon : defaultCatIcon;

    // Generate links.
    const viewLink = "/view/" + mod.url;

    const catParLink = (cat_par) ? "/category/" + cat_par.url : null;
    const catLink = ((cat) ? "/category" + ((cat_par) ? "/" + cat_par.url : "") + "/" + cat.url : null);

    // Generate classes.
    const addClasses = (cat && cat.classes) ? " " + cat.classes : "";

    // Handle short description.
    const descShort = String(mod.descriptionShort);

    return (
        <>
            {display == "grid" ? (
                <GridRow
                    mod={mod}
                    addClasses={addClasses}
                    banner={banner}
                    descShort={descShort}
                    cat={cat}
                    catIcon={catIcon}
                    catLink={catLink}
                    catPar={cat_par}
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
                    cat={cat}
                    catIcon={catIcon}
                    catLink={catLink}
                    catPar={cat_par}
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

    const { data, fetchNextPage } = trpc.mod.getAllModsBrowser.useInfiniteQuery({
        categories: (categories) ? JSON.stringify(categories) : null,
        timeframe: filters?.timeframe ?? null,
        sort: filters?.sort ?? null,
        search: filters?.search ?? null,
        visible: (visible != null) ? visible : true
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
                    <h3 key="loading" className="loading-bar">
                        <LoadingIcon
                            classes={["w-8", "h-8", "mr-2", "text-gray-200", "animate-spin", "fill-blue-600"]}
                        />
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