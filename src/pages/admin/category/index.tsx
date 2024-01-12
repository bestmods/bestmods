import AdminPanel from "@components/admin/panel";
import CategoryBrowser from "@components/category/browser";
import NoAccess from "@components/errors/noaccess";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import { HasRole } from "@utils/roles";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Page () {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="Categories - Admin - Best Mods"
            />

            <Main>
                {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) ? (
                    <AdminPanel view="category">
                        <h1>Categories</h1>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-end">
                                <Link
                                    href="/admin/category/add"
                                    className="btn btn-primary"
                                >Add Category</Link>
                            </div>
                            <CategoryBrowser
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