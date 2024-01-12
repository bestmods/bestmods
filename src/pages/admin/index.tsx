import Main from "@components/main";
import MetaInfo from "@components/meta";

import { useSession } from "next-auth/react";

import { HasRole } from "@utils/roles";

import NoAccess from "@components/errors/noaccess";
import AdminPanel from "@components/admin/panel";

export default function Page () {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo />
            <Main>
                {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) ? (
                    <AdminPanel>
                        <h1>Overview</h1>
                        <p>This is the admin overview page.</p>
                    </AdminPanel>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}