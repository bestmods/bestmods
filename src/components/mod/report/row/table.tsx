import ModReportActions from "@components/mod/report_actions";
import { HasRole } from "@utils/roles";
import { useSession } from "next-auth/react";
import { type ModReportWithRelations } from "~/types/mod";

export default function ModReportRowTable ({
    report,
    className
} : {
    report: ModReportWithRelations
    className?: string
}) {
    const { data: session } = useSession();

    return (
        <tr className={className}>
            <td>{report.id.toString()}</td>
            <td>{report.mod.name}</td>
            <td>
                {report.user.name}
            </td>
            {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) && (
                <td>
                    <ModReportActions report={report} />
                </td>
            )}
        </tr>
    )
}