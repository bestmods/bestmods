import { type Permissions, type User } from "@prisma/client";

import FormTemplate from '../main';
import { AlertForm } from '../../alert';
import Link from "next/link";
import { useMemo, useState } from "react";
import { trpc } from "../../../utils/trpc";
import { Field, useFormik } from "formik";

type user_vals = {
    id: string,
    name?: string,
    email?: string,
    avatar?: string,
    aremove: boolean
}

const UserForm: React.FC<{
    user: User | null
}> = ({
    user
}) => {
    // Mutations.
    const user_add_mut = trpc.user.updateUser.useMutation();

    // Error and success messages.
    let error: string | null = null;
    let success: string | null = null;

    if (user_add_mut.isSuccess)
        success = "Successfully modified user!";
    else if (user_add_mut.isError)
        error = user_add_mut.error.message;

    // Avatar data.
    const [avatar, setAvatar] = useState<string | ArrayBuffer | null>(null);

    // Submit button.
    const submitBtn =
        <div className="text-center">
            <button type="submit" className="btn btn-blue">{!user ? "Add User!" : "Edit User!"}</button>
        </div>;

    // Form.
    const form = useFormik({
        initialValues: {
            name: user?.name ?? "",
            email: user?.email ?? "",
            aremove: false
        },
        onSubmit: (values) => {
            if (user) {
                const new_vals: user_vals = { 
                    ...values, 
                    id: user.id,
                    avatar: avatar?.toString() ?? undefined
                };

                user_add_mut.mutate(new_vals);

                // Scroll to top.
                if (typeof window !== undefined) {
                    window.scroll({
                        top: 0,
                        left: 0,
                        behavior: 'smooth'
                    });
                }
            }
        }
    });

    return (
        <>
           <AlertForm
                error={error}
                success={success}
            />
            <FormTemplate
                form={form}
                submitBtn={submitBtn}
            >
                <h2>General Information</h2>

                <div className="form-container">
                    <label className="form-label">Avatar</label>
                    <input className="form-input" name="avatar" type="file" placeholder="Avatar" onChange={(e) => {
                        const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                        if (file) {
                            const reader = new FileReader();

                            reader.onloadend = () => {
                                setAvatar(reader.result);
                            };
                            
                            reader.readAsDataURL(file);
                        }
                    }} />

                    <Field className="form-checkbox" name="iremove" type="checkbox" /> <label className="form-checkbox-label">Remove Current</label>
                </div>

                <div className="form-container">
                    <label className="form-label">Name</label>
                    <Field className="form-input" name="name" type="text" placeholder="User's name" />
                </div>

                <div className="form-container">
                    <label className="form-label">Email</label>
                    <Field className="form-input" name="email" type="text" placeholder="User's email" />
                </div>

                <Permissions
                    user={user}
                />
            </FormTemplate>
        </>
    );
}

const Permissions: React.FC<{
    user: User | null
}> = ({
    user
}) => {    
    // Queries. We're using a query so we can keep our permission list update to date without reloading our page.
    const perm_list_query = trpc.permission.retrieveUserPerms.useQuery({
        id: user?.id ?? ""
    });
    const permissions = perm_list_query.data;

    // Mutations.
    const perm_add_mut = trpc.permission.addUserPerm.useMutation();
    const perm_del_mut = trpc.permission.delUserPerm.useMutation();

    let error: string | null = null;
    let success: string | null = null;

    // To Do: Figure out how to make sure one of the mutations are false at all times.
    if (perm_add_mut.isSuccess) {
        success = "Successfully added permission!";
        error = null;
    } else if (perm_add_mut.isError) {
        error = perm_add_mut.error.message;
        success = null;
    }
    
    if (perm_del_mut.isSuccess) {
        success = "Successfully removed permission!";
        error = null;
    } else if (perm_del_mut.isError) {
        error = perm_del_mut.error.message;
        success = null;
    }

    const permissions_list = useMemo(() => {
        // Refetch items.
        perm_list_query.refetch();

        return (
            <>
                {permissions?.map((permission: Permissions) => {
                    if (!permission)
                        return;

                    return (
                        <Link key={"user-permission-" + permission.perm} href="/" onClick={(e) => {
                            e.preventDefault();
                            
                            perm_del_mut.mutate({
                                id: permission.userId,
                                perm: permission.perm
                            });
                        }}>{permission.perm}</Link>
                    );
                })}
            </>
        );
    }, [perm_del_mut, perm_list_query, permissions]);

    return (
        <>
            <h2>Permissions</h2>
            <AlertForm
                error={error}
                success={success}
            />
            <div className="form-container">
                <div className="user-edit-permissions-items">
                    {permissions_list}
                </div>
                <div className="form-container user-edit-permissions-container">
                    <label>Permission</label>
                    <input type="text" className="form-input" id="permission" />
                    <button type="button" onClick={(e) => {
                        e.preventDefault();

                        if (user) {
                            const perm = (document.getElementById("permission") as HTMLInputElement).value;

                            perm_add_mut.mutate({
                                id: user.id,
                                perm: perm
                            });
                        }
                    }}>Add!</button>
                </div>
            </div>
        </>
    );
}

export default UserForm;