import NoAccess from "@components/errors/noaccess";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import { HasRole } from "@utils/roles";
import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import RedirectForm from "@components/forms/redirect/main";

export default function Page({
    authed
} : {
    authed: boolean
}) {
    return (
        <>
            <MetaInfo
                title="Add Redirect - Admin - Best Mods"
            />
            <Main>
                {authed ? (
                    <>
                        <h1>Add Redirect</h1>
                        <RedirectForm />
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