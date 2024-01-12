import Main from "@components/main";
import MetaInfo from "@components/meta";
import NoAccess from "@components/errors/noaccess";
import { HasRole } from "@utils/roles";
import { useSession } from "next-auth/react";

import SourceForm from "@components/forms/source/main";
import AdminPanel from "@components/admin/panel";

export default function Page () {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="Add Source - Admin - Best Mods"
            />
            <Main>
                {HasRole(session, "ADMIN") ? (
                    <AdminPanel view="source">
                        <h1>Add Source</h1>
                        <SourceForm  />
                    </AdminPanel>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}