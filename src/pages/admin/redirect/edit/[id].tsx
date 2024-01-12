import NoAccess from "@components/errors/noaccess";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import { prisma } from "@server/db/client";
import { HasRole } from "@utils/roles";
import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import RedirectForm from "@components/forms/redirect/main";
import { type Redirect } from "@prisma/client";
import NotFound from "@components/errors/notfound";

export default function Page({
    authed,
    redirect
} : {
    authed: boolean
    redirect?: Redirect
}) {
    return (
        <>
            <MetaInfo
                title="Add Redirect - Admin - Best Mods"
            />
            <Main>
                {authed ? (
                    <>
                        {redirect ? (
                            <>
                                <h1>Editing Redirect {redirect.url}</h1>
                                <RedirectForm redirect={redirect} />
                            </>
                        ) : (
                            <NotFound item="redirect" />
                        )}
                    </>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { res, params } = ctx;

    // Get session and auth.
    const session = await getServerAuthSession(ctx);

    let authed = false;

    if (HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR"))
        authed = true

    if (!authed)
        res.statusCode = 401;

    const id = params?.id?.toString();

    // Get redirect.
    let redirect: Redirect | null = null;

    if (authed && id) {
        redirect = await prisma.redirect.findFirst({
            where: {
                id: Number(id)
            }
        })
    }

    return {
        props: {
            authed: authed,
            redirect: redirect
        }
    }
}