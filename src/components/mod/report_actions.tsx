import { ErrorCtx, SuccessCtx } from "@pages/_app";
import ScrollToTop from "@utils/scroll";
import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useContext, useState } from "react";
import { type ModReportWithRelations } from "~/types/mod";

export default function ModReportActions ({
    report
} : {
    report: ModReportWithRelations
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const [status, setStatus] = useState(report.status);

    const statusMut = trpc.modReport.setStatus.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Set Report Status");
                errorCtx.setMsg("There was an error setting the report status. Please check your console.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Report Status Changed!");
                successCtx.setMsg(`Successfully changed status to '${status}'!`);

                ScrollToTop();
            }
        }
    })

    return (
        <div className="flex flex-wrap gap-2">
            {status !== "PENDING" && (
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                        statusMut.mutate({
                            id: report.id,
                            status: "PENDING"
                        });

                        setStatus("PENDING");
                    }}
                >Pending</button>
            )}
            {status !== "RESOLVED" && (
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                        statusMut.mutate({
                            id: report.id,
                            status: "RESOLVED"
                        });

                        setStatus("RESOLVED");
                    }}
                >Resolve</button>
            )}
            {status !== "REJECTED" && (
                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                        statusMut.mutate({
                            id: report.id,
                            status: "REJECTED"
                        });

                        setStatus("REJECTED");
                    }}
                >Reject</button>
            )}
            <Link
                href={`/admin/report/view/${report.id.toString()}`}
                className="btn btn-secondary"
            >View</Link>
        </div>
    )
}