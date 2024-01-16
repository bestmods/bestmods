import AdminPanel from "@components/admin/panel";
import NoAccess from "@components/errors/noaccess";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import ModBrowser from "@components/mod/browser";
import { HasRole } from "@utils/roles";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Page () {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="Mods - Admin - Best Mods"
            />
            <Main>
                {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) ? (
                    <AdminPanel view="mod">
                        <h1>Mods</h1>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-end">
                                <Link
                                    href="/admin/mod/add"
                                    className="btn btn-primary"
                                >Add Mod</Link>
                            </div>
                            <ModBrowser
                                showActions={true}
                                showDebug={true}
                                incVisibleColumn={true}
                            />
                        </div>
                    </AdminPanel>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}