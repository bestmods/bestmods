import { type User } from "@prisma/client";
import { type GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import EditForm from "@components/forms/user/main";

import { prisma } from "@server/db/client";

import { Has_Perm } from "@utils/permissions";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import NoAccess from "@components/errors/noaccess";

export default function Page ({
    user
} : {
    user: User | null
}) {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title={"Editing User " + user?.name ?? "N/A" + " - Best Mods"}
            />
            <Main>
                <div className="flex flex-col gap-2">
                    {Has_Perm(session, "admin") ? (
                        <>
                            <h1 className="page-title">Editing User</h1>
                            <EditForm user={user} />
                        </>
                    ) : (
                        <NoAccess />
                    )}
                </div>
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    let user: User | null = null;

    // Our user ID.
    const id = (ctx.params?.id && ctx.params?.id[0]) ? ctx.params.id[0] : "";

    // Retrieve session and permission check.
    const session = await getServerAuthSession(ctx);

    const perm_check = session && Has_Perm(session, "admin");

    if (perm_check) {
        user = await prisma.user.findFirst({
            where: {
                id: id
            }
        });
    }

    return {
        props: {
            user: user
        }
    }
}