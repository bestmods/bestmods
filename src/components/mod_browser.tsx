import React, { useContext } from 'react';
import { trpc } from "../utils/trpc";

import InfiniteScroll from 'react-infinite-scroller';

import { FilterCtx, CookiesCtx } from './main';
import GridRow from './modbrowser/grid_row';
import TableRow from './modbrowser/table_row';

import LoadingIcon from './utils/icons/loading';
import { type ModRowBrowser } from './types';

const ModRow: React.FC<{
    mod: ModRowBrowser,
    display?: string
}> = ({
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
    const cat_par = cat?.parent;

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
    const items: ModRowBrowser[] = [];

    const { data, fetchNextPage } = trpc.mod.getAllModsBrowser.useInfiniteQuery({
        categories: (categories) ? JSON.stringify(categories) : undefined,
        timeframe: filters?.timeframe,
        sort: filters?.sort,
        search: filters?.search,
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

    // Check if we need to sort mods by rating.
    if (filters?.sort == 0) {
        // Sort by rating descending (throw to bottom if undefined).
        items.sort((a, b) => {
            if (a.rating === undefined && b.rating === undefined)
              return 0;
            else if (a.rating === undefined)
              return 1;
            else if (b.rating === undefined)
              return -1;
            else
              return b.rating - a.rating;
          });
    }

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
                                {items.map((mod: ModRowBrowser) => {
                                    console.log()
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
                                    {items.map((mod: ModRowBrowser) => {
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