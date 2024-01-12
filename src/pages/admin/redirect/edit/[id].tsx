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
import AdminPanel from "@components/admin/panel";
import { useSession } from "next-auth/react";

export default function Page({
    redirect
} : {
    redirect?: Redirect
}) {
    const  { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title={`Editing Redirect ${redirect?.url ?? "N/A"} - Admin - Best Mods`}
            />
            <Main>
                {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) ? (
                    <AdminPanel view="redirect">
                        {redirect ? (
                            <>
                                <h1>Editing Redirect {redirect.url}</h1>
                                <RedirectForm redirect={redirect} />
                            </>
                        ) : (
                            <NotFound item="redirect" />
                        )}
                    </AdminPanel>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params } = ctx;

    // Get session and auth.
    const session = await getServerAuthSession(ctx);

    const authed = HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR");

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
            redirect: redirect
        }
    }
}