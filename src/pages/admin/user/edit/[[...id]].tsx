import { type User } from "@prisma/client";
import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

import { BestModsPage } from "@components/main";
import HeadInfo from "@components/head";

import EditForm from "@components/forms/user/create_user";

import { prisma } from "@server/db/client";

import { Has_Perm } from "@utils/permissions";

const EditUser: React.FC<{
    authed: boolean,
    user: User | null
}> = ({
    authed,
    user
}) => {
    return (
        <>
            <HeadInfo
                title={"Editing User " + user?.name ?? "N/A" + " - Best Mods"}
            />
            <BestModsPage>
                <div className="container mx-auto">
                    {authed ? (
                        <>
                            <h1 className="page-title">Editing User</h1>
                            <EditForm user={user} />
                        </>
                    ) : (
                        <div className="unauthorized-div">
                            <p>You do not have permissions to edit a user.</p>
                        </div>
                    )}
                </div>
            </BestModsPage>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    let authed = false;
    let user: User | null = null;

    // Our user ID.
    const id = (ctx.params?.id && ctx.params?.id[0]) ? ctx.params.id[0] : "";

    // Retrieve session and permission check.
    const session = await getSession(ctx);

    const perm_check = session && Has_Perm(session, "admin");

    if (perm_check) {
        authed = true;

        user = await prisma.user.findFirst({
            where: {
                id: id
            }
        });
    }

    return {
        props: {
            authed: authed,
            user: user
        }
    }
}

export default EditUser;