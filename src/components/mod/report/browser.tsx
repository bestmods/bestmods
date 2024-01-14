import Loading from "@components/loading";
import { trpc } from "@utils/trpc";
import { useState } from "react"
import InfiniteScroll from "react-infinite-scroller";
import { type ModReportWithRelations } from "~/types/mod";
import ModReportRow from "./row";
import { type ReportStatus } from "@prisma/client";

export default function ModReportBrowser ({
    view = "table"
} : {
    view?: string
}) {
    // Filters and sort.
    const [status, setStatus] = useState<ReportStatus | undefined>(undefined);
    const [lastUpdated, setLastUpdated] = useState(false);

    const [needMore, setNeedMore] = useState(true);

    const { data, fetchNextPage } = trpc.modReport.getAll.useInfiniteQuery({
        limit: 10,
        status: status,
        sort: lastUpdated ? "lastUpdated" : undefined
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
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-between">
                <div className="p-2 flex items-center flex-wrap gap-2">
                    <div>
                        <button
                            type="button"
                            className={`btn !p-1 btn-primary${lastUpdated ? " !bg-green-500" : ""}`}
                            onClick={() => setLastUpdated(!lastUpdated)}
                        >Last Updated</button>
                    </div>
                </div>
                <div className="p-2">
                    <label>Status</label>
                    <select
                        className="form-input"
                        defaultValue="ALL"
                        onChange={(e) => {
                            const val = e.target.value;

                            if (val == "PENDING")
                                setStatus("PENDING");
                            else if (val == "REJECTED")
                                setStatus("REJECTED");
                            else if (val == "RESOLVED")
                                setStatus("RESOLVED");
                            else
                                setStatus(undefined);
                        }}
                    >
                        <option value="ALL">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                </div>
            </div>
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

        </div>
    )
}