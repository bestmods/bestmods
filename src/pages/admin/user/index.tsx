import { type GetServerSidePropsContext } from "next";
import Link from "next/link";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { type User } from "@prisma/client";

import { prisma } from "@server/db/client";
import { useSession } from "next-auth/react";

import { trpc } from "@utils/trpc";
import { Has_Perm } from "@utils/permissions";
import NoAccess from "@components/errors/noaccess";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import Image from "next/image";

export default function Page ({
    users,
    page_number
} : {
    users: User[]
    page_number: number
}) {
    const { data: session } = useSession();

    // Build list of page numbers (<3 before>, cur_page, <3 after>).
    const pages = Gen_Page_Numbers(page_number, 3);

    return (
        <>
            <MetaInfo 
                title="User Management - Best Mods"
            />

            <Main>
                {Has_Perm(session, "admin") ? (
                    <div className="container mx-auto">
                        <h1 className="page-title">User Management</h1>
                        {users.length > 0 ? (
                            <table className="table table-auto w-full">
                                <thead>
                                    <tr className="bg-cyan-600 font-bold">
                                        <th>Avatar</th>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => {
                                        return (
                                            <UserRow key={"user-" + user.id} user={user} />
                                        );
                                    })}
                                </tbody>
                            </table>

                        ): (
                            <div>
                                <p>No users found.</p>
                            </div>
                            
                        )}
                        <div>
                            {pages.map((i) => {
                                return (
                                    <Link key={"page-num-" + i} href={"/admin/user/?p=" + i}>{i.toString()}</Link>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <NoAccess />                
                )}
            </Main>
        </>
    )
}

const UserRow: React.FC<{
    user: User
}> = ({
    user
}) => {
    // User image/avatar.
    const avatar = user.image || null;

    // Actions.
    const edit_link = "/admin/user/edit/" + user.id;

    const user_del_mut = trpc.user.del.useMutation();

    return (
        <tr>
            <td>
                {avatar && (
                    <Image
                        src={`/${avatar}`}
                        width={32}
                        height={32}
                        alt="User Avatar"
                    />
                )}
            </td>
            <td>
                {user.id.toString()}
            </td>
            <td>
                {user.name}
            </td>
            <td>
                {user.email}
            </td>
            <td className="flex gap-5 justify-center">
                <Link href={edit_link}>Edit</Link>
                <Link
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();

                        if (confirm("Are you sure?")) {
                            user_del_mut.mutate({
                                id: user.id
                            });
                        }
                    }}
                >Delete</Link>
            </td>
        </tr>
    )
}

function Gen_Page_Numbers(page_num: number, count: number): number[] {
    const pages = [];

    // Handle pages before.
    for (let i = 1; i <= count; i++) {
        const val = page_num - i;

        if (val > 0)
            pages.push(val);
    }

    pages.push(page_num);

    // Handle pages after.
    for (let i = 1; i <= count; i++) {
        const val = page_num + i;

        pages.push(val);
    }

    return pages;
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Get pagination options.
    const users_per_page = Number(process.env.ADMIN_USERS_PER_PAGE) || 15;
    const page_number = (ctx.query?.p) ? Number(ctx.query.p.toString()) : 1;

    //const admin_only = (ctx.query?.admins_only) ? true : false;
    //const contributors_only = (ctx.query?.contributors_only) ? true : false;
    
    let users: User[] = [];

    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    // Permission check.
    const perm_check = session && Has_Perm(session, "admin");

    if (perm_check) {        
        const offset = Number(users_per_page) * (page_number - 1);

        users = await prisma.user.findMany({
            skip: offset,
            take: users_per_page ?? 15
        });
    }

    return {
        props: {
            users: users,
            page_number: page_number
        }
    }
}