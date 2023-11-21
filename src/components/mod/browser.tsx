import React, { useContext } from "react";

import InfiniteScroll from "react-infinite-scroller";

import { FilterCtx, CookiesCtx } from "@components/main";
import ModRow from "./browser/row";
import { trpc } from "@utils/trpc";
import LoadingIcon from "@components/icons/loading";

import { type ModRowBrowser } from "~/types/mod";

export default function ModBrowser ({
    categories,
    visible
} : {
    categories?: Array<number> | null,
    visible?: boolean | null
}) {
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
        getNextPageParam: (lastPage) => lastPage.next_cur,
    });

    const loadMore = () => {
        fetchNextPage();
    };

    if (data) {
        data.pages.forEach((pg) => {
            items.push(...pg.items);

            // If next cursor is undefined, we're at the end.
            if (!pg.next_cur)
                requireItems = false;
        });
    }

    // Figure out which display.
    let display = "grid";
    const cookies = useContext(CookiesCtx);

    if (cookies && cookies["bm_display"] != undefined && cookies["bm_display"] != "grid")
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
                            className={"w-8 h-8 mr-2 text-gray-200 animate-spin fill-blue-600"}
                        />
                        <span>Loading...</span>
                    </h3>
                }
            >
                {display == "grid" ? (
                    <>
                        {items.length > 0 ? (
                            <>
                                {items.map((mod) => {
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
                                    {items.map((mod) => {
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
    )
}