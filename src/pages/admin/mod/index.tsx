import NoAccess from "@components/errors/noaccess";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import ModBrowser from "@components/mod/browser";
import { HasRole } from "@utils/roles";
import { useSession } from "next-auth/react";

export default function Page () {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="Mods - Admin"
            />
            <Main>
                <h1>Mods Moderation</h1>
                {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) ? (
                    <div>
                        <ModBrowser showModActions={true} />
                    </div>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}