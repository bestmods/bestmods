import Loading from "@components/loading";
import { trpc } from "@utils/trpc";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { type CategoryWithChildrenAndCounts } from "~/types/category";
import CategoryRowTable from "./row/table";

export default function CategoryBrowser ({
    view = "table",
    showActions = false
} : {
    view?: string
    showActions?: boolean
}) {
    const [needMore, setNeedMore] = useState(true);

    const { data, fetchNextPage } = trpc.category.getCategoryMappingsAll.useInfiniteQuery({
        limit: 10
    }, {
        getNextPageParam: (nextPg) => nextPg.nextCat
    })

    const loadMore = async () => {
        await fetchNextPage();
    }

    const categories: CategoryWithChildrenAndCounts[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            categories.push(...pg.categories);

            if (!pg.nextCat && needMore)
                setNeedMore(false);
        })
    }

    const notDone = !data || categories.length > 0;

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
                                    <td>ID</td>
                                    <td>Name</td>
                                    <td>URL</td>
                                    <td>Mods</td>
                                    {showActions && (
                                        <td>Actions</td>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category, index) => {
                                    return (
                                        <CategoryRowTable
                                            key={`category-${index.toString()}`}
                                            category={category}
                                            showActions={showActions}
                                            className="bg-bestmods-4/80"
                                        />
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm">No categories found.</p>
                    )}
                </InfiniteScroll>
            )}
            
        </>
    )
}