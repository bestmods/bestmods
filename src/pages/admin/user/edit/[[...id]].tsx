import { User } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

import { prisma } from '../../../../server/db/client';
import HeadInfo from "../../../../components/head";
import { BestModsPage } from "../../../../components/main";
import EditForm from "../../../../components/forms/user/create_user";

const EditUser: React.FC<{
    authed: boolean,
    user: any | null
}> = ({
    authed,
    user
}) => {
    return (
        <>
            <HeadInfo
                title={"Editing User " + user.name + " - Best Mods"}
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
    let user: any | null = null;

    // Our user ID.
    const id = (ctx.params?.id && ctx.params?.id[0]) ? ctx.params.id[0] : "";

    // Retrieve session and permission check.
    const session = await getSession(ctx);

    const perm_check = await prisma.permissions.findFirst({
        where: {
            userId: session?.user?.id ?? "",
            perm: "admin"
        }
    });

    if (session && perm_check) {
        authed = true;

        user = await prisma.user.findFirst({
            where: {
                id: id
            },
            include: {
                Permissions: true
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