import Loading from "@components/loading";
import { Redirect } from "@prisma/client";
import { trpc } from "@utils/trpc";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import RedirectRow from "./row";

export default function RedirectBrowser({
    view = "table"
} : {
    view?: string
}) {
    const [needMoreRedirects, setNeedMoreRedirects] = useState(true);

    const { data, fetchNextPage } = trpc.redirect.getAll.useInfiniteQuery({
        limit: 10
    }, {
        getNextPageParam: (nextPg) => nextPg.nextCur
    })

    const loadMore = async () => {
        await fetchNextPage();
    }

    const redirects: Redirect[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            redirects.push(...pg.redirects);

            if (!pg.nextCur && needMoreRedirects)
                setNeedMoreRedirects(false);
        })
    }

    const redirectsOrLoading = !data || redirects.length > 0;

    return (
        <>
            {view == "table" && (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    hasMore={needMoreRedirects}
                    loader={<Loading key="loading" />}
                >
                    {redirectsOrLoading ? (
                        <table className="w-full table table-auto">
                            <thead>
                                <tr className="font-bold text-white">
                                    <td>URL</td>
                                    <td>Redirect</td>
                                    <td>Actions</td>
                                </tr>
                            </thead>
                            <tbody>
                                {redirects.map((redirect, index) => {
                                    return (
                                        <RedirectRow
                                            key={`redirect-${index.toString()}`}
                                            redirect={redirect}
                                        />
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm">No redirects found.</p>
                    )}
                </InfiniteScroll>
            )}
            
        </>
    )
}