import NoAccess from "@components/errors/noaccess";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import RedirectBrowser from "@components/redirects/browser";
import { HasRole } from "@utils/roles";
import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import Link from "next/link";

export default function Page({
    authed
} : {
    authed: boolean
}) {
    return (
        <>
            <MetaInfo
                title="Redirects - Admin - Best Mods"
            />
            <Main>
                {authed ? (
                    <>
                        <h1>Redirects</h1>
                        <div className="bg-bestmods-2/80 p-6 rounded">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-end">
                                    <Link
                                        href="/admin/redirect/add"
                                        className="btn btn-primary"
                                    >Add Redirect</Link>
                                </div>
                                <RedirectBrowser />
                            </div>
                        </div>
                    </>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { res } = ctx;
    const session = await getServerAuthSession(ctx);

    let authed = false;

    if (HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR"))
        authed = true

    if (!authed)
        res.statusCode = 401;

    return {
        props: {
            authed: authed
        }
    }
}