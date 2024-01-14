import AdminPanel from "@components/admin/panel";
import NoAccess from "@components/errors/noaccess";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import ModReportBrowser from "@components/mod/report/browser";
import { HasRole } from "@utils/roles";
import { useSession } from "next-auth/react";

export default function Page () {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="Reports - Admin - Best Mods"
            />
            <Main>
                {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) ? (
                    <AdminPanel view="report">
                        <h1>Reports</h1>
                        <ModReportBrowser />
                    </AdminPanel>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}