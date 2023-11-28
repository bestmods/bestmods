import React, { useContext, useState } from "react";

import InfiniteScroll from "react-infinite-scroller";

import { CookiesCtx } from "@components/main";
import ModRow from "./browser/row";
import { trpc } from "@utils/trpc";
import LoadingIcon from "@components/icons/loading";

import { type ModRowBrowser } from "~/types/mod";
import ModBrowserFilters from "./browser/filters";

export default function ModBrowser ({
    categories,
    visible
} : {
    categories?: Array<number> | null,
    visible?: boolean | null
}) {
    // Filters
    const [timeframe, setTimeframe] = useState(0);
    const [sort, setSort] = useState(0);
    const [search, setSearch] = useState<string | undefined>(undefined);

    let requireItems = true;
    const items: ModRowBrowser[] = [];

    const { data, fetchNextPage } = trpc.mod.getAllBrowser.useInfiniteQuery({
        categories: (categories) ? JSON.stringify(categories) : undefined,
        timeframe: timeframe,
        sort: sort,
        search: search || undefined,
        visible: visible ?? true
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
    const cookies = useContext(CookiesCtx);

    const [display, setDisplay] = useState(cookies?.["bm_display"] ?? "grid");

    return (
        <div className="flex flex-col gap-4">
            <ModBrowserFilters
                setTimeframe={setTimeframe}
                setSort={setSort}
                setSearch={setSearch}

                display={display}
                setDisplay={setDisplay}
            />
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