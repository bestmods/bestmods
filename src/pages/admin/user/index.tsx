import { type User } from "@prisma/client";
import { type GetServerSidePropsContext } from "next";

import { prisma } from "../../../server/db/client";
import { getSession } from "next-auth/react";
import HeadInfo from "../../../components/head";
import { BestModsPage } from "../../../components/main";
import Link from "next/link";
import { trpc } from "../../../utils/trpc";
import { Has_Perm } from "../../../utils/permissions";

const Index: React.FC<{
    authed: boolean,
    users: User[],
    page_number: number
}> = ({
    authed,
    users,
    page_number
}) => {
    // Build list of page numbers (<3 before>, cur_page, <3 after>).
    const pages = Gen_Page_Numbers(page_number, 3);

    return (
        <>
            <HeadInfo 
                title="User Management - Best Mods"
            />

            <BestModsPage>
                {authed ? (
                    <div className="container mx-auto">
                        <h1 className="page-title">User Management</h1>
                        {users.length > 0 ? (
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>Avatar</th>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user: any) => {
                                        return (
                                            <UserRow key={"user-" + user.id} user={user} />
                                        );
                                    })}
                                </tbody>
                            </table>

                        ): (
                            <div className="unauthorized-div">
                                <p>No users found.</p>
                            </div>
                            
                        )}
                        <div className="user-page-numbers">
                            {pages.map((i: number) => {
                                return (
                                    <Link key={"page-num-" + i} href={"/admin/user/?p=" + i}>{i.toString()}</Link>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="unauthorized-div">
                        <p>You are not authorized to view this page!</p>
                    </div>                    
                )}
            </BestModsPage>
        </>
    );
}

const UserRow: React.FC<{
    user: any
}> = ({
    user
}) => {
    // User image/avatar.
    const avatar = user.image || null;

    // Actions.
    const edit_link = "/admin/user/edit/" + user.id;

    const user_del_mut = trpc.user.delUser.useMutation();

    return (
        <tr>
            <td className="user-table-avatar">
                {avatar && (
                    <img src={avatar} alt="User Avatar" />
                )}
            </td>
            <td className="user-table-id">
                {user.id.toString()}
            </td>
            <td className="user-table-username">
                {user.name}
            </td>
            <td className="user-table-email">
                {user.email}
            </td>
            <td className="user-table-actions">
                <Link href={edit_link} className="user-table-action-edit">Edit</Link>
                <Link href="#" className="user-table-action-delete" onClick={(e) => {
                    e.preventDefault();

                    if (confirm("Are you sure?")) {
                        user_del_mut.mutate({
                            id: user.id
                        });
                    }
                }}>Delete</Link>
            </td>
        </tr>
    );
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
    let authed = false;

    // Retrieve session.
    const session = await getSession(ctx);

    // Permission check.
    const perm_check = session && Has_Perm(session, "admin");

    if (perm_check) {
        authed = true;
        
        const offset = Number(users_per_page) * (page_number - 1);

        users = await prisma.user.findMany({
            skip: offset,
            take: users_per_page ?? 15
        });
    }

    return {
        props: {
            users: users,
            authed: authed,
            page_number: page_number
        }
    }
}

export default Index;