import React, { useContext, useEffect, useState } from "react";

import InfiniteScroll from "react-infinite-scroller";

import ModRow from "./browser/row";
import { trpc } from "@utils/trpc";

import { type ModRowBrowser } from "~/types/mod";
import ModBrowserFilters from "./browser/filters";
import Loading from "@components/loading";
import { useCookies } from "react-cookie";
import { ViewPortCtx } from "@components/main";

export default function ModBrowser ({
    preCategories = [],
    visible,
    showActions = false,
    showDebug = false
} : {
    preCategories?: number[]
    visible?: boolean
    showActions?: boolean
    showDebug?: boolean
}) {
    const viewPort = useContext(ViewPortCtx);

    const [needMoreMods, setNeedMoreMods] = useState(true);

    // Filters
    const [timeframe, setTimeframe] = useState(0);
    const [sort, setSort] = useState(0);
    const [search, setSearch] = useState<string | undefined>(undefined);

    const [categories, setCategories] = useState(preCategories);

    // Reset need more mods when filters change.
    useEffect(() => {
        setNeedMoreMods(true);
    }, [timeframe, sort, search, categories])

    const mods: ModRowBrowser[] = [];

    const { data, fetchNextPage } = trpc.mod.getAllBrowser.useInfiniteQuery({
        categories: categories,
        timeframe: timeframe,
        sort: sort,
        search: search || undefined,
        visible: visible
    }, {
        getNextPageParam: (lastPage) => lastPage.nextMod,
    });

    const loadMore = async () => {
        await fetchNextPage();
    };

    if (data) {
        data.pages.forEach((pg) => {
            mods.push(...pg.mods);

            // If next cursor is undefined, we're at the end.
            if (!pg.nextMod && needMoreMods)
                setNeedMoreMods(false)
        });
    }

    const modsOrLoading = !data || mods.length > 0;

    // Figure out which display.
    const [cookies] = useCookies(["bm_display"]);

    const [display, setDisplay] = useState("grid");

    useEffect(() => {
        if (cookies["bm_display"] === "table")
            setDisplay("table");
    }, [cookies])

    return (
        <div className="flex flex-col gap-4">
            <ModBrowserFilters
                setTimeframe={setTimeframe}
                setSort={setSort}
                setSearch={setSearch}

                categories={categories}
                setCategories={setCategories}

                display={display}
                setDisplay={setDisplay}
            />
            {display == "grid" ? (
                <InfiniteScroll
                    pageStart={0}
                    className="grid gap-x-4 gap-y-6"
                    style={{
                        gridTemplateColumns: `repeat(auto-fill, minmax(${viewPort.isMobile ? `100%` : `320px`}, 1fr))`
                    }}
                    loadMore={loadMore}
                    hasMore={needMoreMods}
                    loader={<Loading key="loading" />}
                >
                    {modsOrLoading ? (
                        <>
                            {mods.map((mod) => {
                                return (
                                    <ModRow
                                        key={mod.id + "-row"}
                                        mod={mod}
                                        showActions={showActions}
                                        showDebug={showDebug}
                                        display={display}
                                    />
                                );
                            })}
                        </>
                    ) : (
                        <p className="mods-not-found">No mods found.</p>

                    )}
                </InfiniteScroll>
            ) : (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    hasMore={needMoreMods}
                >
                    {modsOrLoading ? (
                        <table className="table table-auto w-full [overflow-wrap:anywhere]">
                            <tbody>
                                {mods.map((mod) => {
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
                        <p className="mods-not-found">No mods found.</p>
                    )}
                </InfiniteScroll>
            )}
        </div>
    )
}