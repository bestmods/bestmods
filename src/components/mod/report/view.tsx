import Markdown from "@components/markdown/markdown";
import { HasRole } from "@utils/roles";
import { useSession } from "next-auth/react";
import { type ModReportWithRelations } from "~/types/mod";
import ModReportActions from "../report_actions";

export default function ModReportView ({
    report
} : {
    report: ModReportWithRelations
}) {
    const { data: session } = useSession();

    return (
        <div className="flex flex-col gap-2 h-full max-h-full">
            <h2>Viewing Report For {report.mod.name} (ID {report.id.toString()})</h2>
            <span>Reported by {report.user.name} ({report.user.email})</span>
            <Markdown className="markdown">
                {report.contents}
            </Markdown>
            <div className="grow"></div>
            {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) && (
                <div className="flex justify-center">
                    <ModReportActions report={report} />
                </div>
            )}
        </div>
    )
}