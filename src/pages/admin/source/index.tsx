import AdminPanel from "@components/admin/panel";
import NoAccess from "@components/errors/noaccess";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import SourceBrowser from "@components/source/browser";
import { HasRole } from "@utils/roles";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Page () {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="Sources - Admin - Best Mods"
            />

            <Main>
                {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) ? (
                    <AdminPanel view="source">
                        <h1>Sources</h1>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-end">
                                <Link
                                    href="/admin/source/add"
                                    className="btn btn-primary"
                                >Add Source</Link>
                            </div>
                            <SourceBrowser
                                view="table"
                                showActions={true}
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