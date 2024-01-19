import NoAccess from "@components/errors/noaccess";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import RedirectBrowser from "@components/redirects/browser";
import { HasRole } from "@utils/roles";
import Link from "next/link";
import AdminPanel from "@components/admin/panel";
import { useSession } from "next-auth/react";

export default function Page() {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="Redirects - Admin - Best Mods"
            />
            <Main>
                {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) ? (
                    <AdminPanel view="redirect">
                        <h2>Redirects</h2>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-end">
                                <Link
                                    href="/admin/redirect/add"
                                    className="btn btn-primary"
                                >Add Redirect</Link>
                            </div>
                            <RedirectBrowser />
                        </div>
                    </AdminPanel>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}