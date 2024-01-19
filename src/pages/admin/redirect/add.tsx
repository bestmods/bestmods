import NoAccess from "@components/errors/noaccess";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import RedirectForm from "@components/forms/redirect/main";
import AdminPanel from "@components/admin/panel";
import { useSession } from "next-auth/react";
import { HasRole } from "@utils/roles";

export default function Page() {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="Add Redirect - Admin - Best Mods"
            />
            <Main>
                {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) ? (
                    <AdminPanel view="redirect">
                        <h2>Add Redirect</h2>
                        <RedirectForm />
                    </AdminPanel>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}