import React, { useContext, useState } from "react";

import InfiniteScroll from "react-infinite-scroller";

import { CookiesCtx } from "@components/main";
import ModRow from "./browser/row";
import { trpc } from "@utils/trpc";

import { type ModRowBrowser } from "~/types/mod";
import ModBrowserFilters from "./browser/filters";
import Loading from "@components/loading";

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
            {display == "grid" ? (
                <InfiniteScroll
                    pageStart={0}
                    className="grid gap-x-4 gap-y-6"
                    style={{
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr)"
                    }}
                    loadMore={loadMore}
                    hasMore={requireItems}
                    loader={<Loading key="loading" />}
                >
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
                </InfiniteScroll>
            ) : (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    hasMore={requireItems}
                >
                    {items.length > 0 ? (
                        <table className="table table-auto w-full">
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
                </InfiniteScroll>
            )}
        </div>
    )
}