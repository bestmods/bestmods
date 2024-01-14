import ModReportRowTable from "./row/table";
import { type ModReportWithRelations } from "~/types/mod";

export default function ModReportRow ({
    report,
    view = "table",
    className
} : {
    report: ModReportWithRelations
    view?: string
    className?: string
}) {
    return (
        <>
            {view == "table" && (
                <ModReportRowTable
                    report={report}
                    className={className}
                />
            )}
        </>
    )
}