import Loading from "@components/loading";
import { Source } from "@prisma/client";
import { trpc } from "@utils/trpc";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import SourceRow from "./row";

export default function SourceBrowser ({
    showActions = false,
    view = "table"
} : {
    showActions?: boolean
    view?: string
}) {
    const [needMore, setNeedMore] = useState(true);

    const { data, fetchNextPage } = trpc.source.getAll.useInfiniteQuery({
        limit: 10
    }, {
        getNextPageParam: (nextPg) => nextPg.nextCur
    })

    const loadMore = async () => {
        await fetchNextPage();
    }

    const sources: Source[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            sources.push(...pg.sources);

            if (pg.nextCur && needMore)
                setNeedMore(false);
        })
    }

    const notDone = !data || sources.length > 0;

    return (
        <>
            {view == "table" && (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    hasMore={needMore}
                    loader={<Loading key="loading" />}
                >
                    {notDone ? (
                        <table className="w-full table table-auto">
                            <thead>
                                <tr className="font-bold text-white">
                                    <td>Name</td>
                                    <td>URL</td>
                                    {showActions && (
                                        <td>Actions</td>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {sources.map((source, index) => {
                                    return (
                                        <SourceRow
                                            key={`source-${index.toString()}`}
                                            source={source}
                                            showActions={showActions}
                                            view="table"
                                        />
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm">No sources found.</p>
                    )}
                </InfiniteScroll>
            )}

        </>
    )


}