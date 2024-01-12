import EditIcon from "@components/icons/edit";
import Loading from "@components/loading";
import { Redirect } from "@prisma/client";
import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";

export default function RedirectBrowser() {
    const [needMoreRedirects, setNeedMoreRedirects] = useState(true);

    const { data, fetchNextPage } = trpc.redirect.getRedirects.useInfiniteQuery({
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
                            const editLink = `/admin/redirect/edit/${redirect.id.toString()}`;

                            return (
                                <tr
                                    key={`redirect-${index.toString()}`}
                                    className=""
                                >
                                    <td>{redirect.url}</td>
                                    <td>{redirect.redirect}</td>
                                    <td>
                                        <Link
                                            href={editLink}
                                            className="btn btn-primary flex justify-center items-center h-8 w-8"
                                        >
                                            <EditIcon className="fill-white" />
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            ) : (
                <p className="text-sm">No redirects found.</p>
            )}
        </InfiniteScroll>
    )
}