import Loading from "@components/loading";
import { type User } from "@prisma/client";
import { trpc } from "@utils/trpc";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import UserRow from "./row";

export default function UserBrowser ({
    view = "table",
    showActions = true
} : {
    view?: string
    showActions?: boolean
}) {
    const [search, setSearch] = useState<string | undefined>(undefined);

    const [needMore, setNeedMore] = useState(true);

    const { data, fetchNextPage } = trpc.user.getAll.useInfiniteQuery({
        limit: 10,
        search: search
    }, {
        getNextPageParam: (nextPg) => nextPg.nextCur
    })

    const loadMore = async () => {
        await fetchNextPage();
    }

    const users: User[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            users.push(...pg.users);

            if (!pg.nextCur && needMore)
                setNeedMore(false);
        })
    }

    const notDone = !data || users.length > 0;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-end gap-2">
                <label>Search</label>
                <input
                    className="form-input sm:!w-96"
                    onChange={(e) => {
                        const val = e.target.value;

                        setSearch(val);
                    }}
                />
            </div>
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
                                {users.map((user, index) => {
                                    return (
                                        <UserRow
                                            key={`user-${index.toString()}`}
                                            user={user}
                                            showActions={showActions}
                                        />
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm">No users found.</p>
                    )}
                </InfiniteScroll>
            )}
        
        </div>
    )
}