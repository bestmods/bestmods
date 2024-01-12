import Main from "@components/main";
import MetaInfo from "@components/meta";

import { useSession } from "next-auth/react";

import { HasRole } from "@utils/roles";
import NoAccess from "@components/errors/noaccess";
import AdminPanel from "@components/admin/panel";
import UserBrowser from "@components/user/browser";

export default function Page () {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo 
                title="Users - Admin - Best Mods"
            />

            <Main>
                {HasRole(session, "ADMIN") ? (
                    <AdminPanel view="user">
                        <h1>Users</h1>
                        <UserBrowser
                            view="table"
                            showActions={true}
                        />
                    </AdminPanel>
                ) : (
                    <NoAccess />                
                )}
            </Main>
        </>
    )
}