import Loading from "@components/loading";
import { trpc } from "@utils/trpc";
import { useState } from "react"
import InfiniteScroll from "react-infinite-scroller";
import { type ModReportWithRelations } from "~/types/mod";
import ModReportRow from "./row";

export default function ModReportBrowser ({
    view = "table"
} : {
    view?: string
}) {
    const [needMore, setNeedMore] = useState(true);

    const { data, fetchNextPage } = trpc.modReport.getAll.useInfiniteQuery({
        limit: 10
    }, {
        getNextPageParam: (nextPg) => nextPg.nextCur
    })

    const loadMore = async () => {
        await fetchNextPage();
    }

    const reports: ModReportWithRelations[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            reports.push(...pg.reports);

            if (!pg.nextCur && needMore)
                setNeedMore(false);
        })
    }

    const reportsOrLoading = !data || reports.length > 0;

    
    return (
        <>
            {reportsOrLoading ? (
                <>
                    {view == "table" && (
                        <InfiniteScroll
                            pageStart={0}
                            loadMore={loadMore}
                            hasMore={needMore}
                            loader={<Loading key="loading" />}
                        >
                            <table className="table table-auto w-full">
                                <thead>
                                    <tr className="font-bold text-white text-left">
                                        <th>ID</th>
                                        <th>Mod Name</th>
                                        <th>User</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report, index) => {
                                        return (
                                            <ModReportRow
                                                key={`report-${index.toString()}`}
                                                report={report}
                                            />
                                        )
                                    })}
                                </tbody>
                            </table>
                        </InfiniteScroll>
                    )}
                </>
            ) : (
                <p className="text-sm">No reports found.</p>
            )}

        </>
    )
}