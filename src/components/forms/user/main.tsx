import { useContext, useState } from "react";
import { trpc } from "../../../utils/trpc";
import { Field, Form, Formik } from "formik";

import { type Permissions, type User } from "@prisma/client";

import ScrollToTop from "@utils/scroll";
import { GetContents } from "@utils/file";
import { ErrorCtx, SuccessCtx } from "@pages/_app";
import FormCheckbox from "../checkbox";

export default function UserForm ({
    user
} : {
    user: User | null
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Mutations.
    const mut = trpc.user.update.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle(`Error ${user ? "Saving" : "Adding"} User`);
                errorCtx.setMsg(`There was an error when attempting to ${user ? "save" : "add"} user. Please check the console for more details.`);

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${user ? "Saved" : "Added"} User!`);
                successCtx.setMsg(`Successfully ${user ? "saved" : "added"} user!`);

                ScrollToTop();
            }
        }
    });

    // Avatar data.
    const [avatar, setAvatar] = useState<string | ArrayBuffer | null>(null);
        
    return (
        <Formik
            initialValues={{
                name: user?.name ?? "",
                email: user?.email ?? "",
                aremove: false
            }}
            onSubmit={(values) => {
                if (user) {
                    mut.mutate({
                        ...values,
                        id: user.id,
                        avatar: avatar?.toString()
                    });
    
                    // Scroll to top.
                    ScrollToTop();
                }
            }}
        >
            {() => (
                <Form className="bg-bestmods-2/80 p-2 rounded">
                    <h2>General Information</h2>
                    <div className="p-2">
                        <label htmlFor="avatar" >Avatar</label>
                        <input
                            type="file"
                            name="avatar"
                            placeholder="Avatar" 
                            onChange={async (e) => {
                                const file = e.target.files?.[0];

                                if (file) {
                                    const contents = await GetContents(file);

                                    setAvatar(contents);
                                }
                            }}
                        />
                        <div className="p-2">
                            <FormCheckbox
                                name="iremove"
                                text={<span>Remove Current</span>}
                            />
                        </div>
                    </div>
                    <div className="p-2">
                        <label htmlFor="name">Name</label>
                        <Field
                            type="text"
                            name="name"
                            placeholder="User's name"
                        />
                    </div>
                    <div className="p-2">
                        <label htmlFor="email">Email</label>
                        <Field
                            type="text"
                            name="email"
                            placeholder="User's email"
                        />
                    </div>
                    <h2>Permissions</h2>
                    <Permissions user={user} />
                    <div className="text-center">
                        <button 
                            type="submit"
                            className="btn btn-primary"
                        >{!user ? "Add User!" : "Edit User!"}</button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}

const Permissions: React.FC<{
    user: User | null
}> = ({
    user
}) => {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Queries. We're using a query so we can keep our permission list update to date without reloading our page.
    const perm_list_query = trpc.permission.retrieveUserPerms.useQuery({
        id: user?.id ?? ""
    });
    const permissions = perm_list_query.data;

    // Mutations.
    const perm_add_mut = trpc.permission.addUserPerm.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Error Adding Permission!");
                errorCtx.setMsg("There was an error adding this permission. Please check the console!");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Added Permission!");
                successCtx.setMsg("The permission was added successfully!");

                ScrollToTop();
            }
        }
    });

    const perm_del_mut = trpc.permission.delUserPerm.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Error Removing Permission!");
                errorCtx.setMsg("There was an error removing this permission. Please check the console!");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Removed Permission!");
                successCtx.setMsg("The permission was removed successfully!");

                ScrollToTop();
            }
        }
    });

    const [perm, setPerm] = useState<string | undefined>(undefined);

    return (
        <div className="p-2 flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {permissions?.map((permission, index) => {
                    return (
                        <button 
                            key={`permissions-${index.toString()}`}
                            onClick={(e) => {
                                e.preventDefault();
                                
                                perm_del_mut.mutate({
                                    id: permission.userId,
                                    perm: permission.perm
                                });
                            }}
                            className="btn btn-secondary"
                        >{permission.perm}</button>
                    );
                })}
            </div>
            <div className="bg-bestmods-3/80 rounded p-2 flex flex-wrap gap-2">
                <label>Permission</label>
                <input 
                    type="text"
                    className="!w-auto grow"
                    onChange={(e) => {
                        const val = e.target.value;

                        setPerm(val);
                    }}
                />
                <button
                    className="btn btn-primary"
                    onClick={(e) => {
                        e.preventDefault();

                        if (!perm) {
                            if (errorCtx) {
                                errorCtx.setTitle("Missing Permission!");
                                errorCtx.setMsg("The permission is missing. Please make sure there is a permission specified to add!");
                            }

                            return;
                        }

                        if (user) {
                            perm_add_mut.mutate({
                                id: user.id,
                                perm: perm
                            });
                        }
                    }}
                >Add!</button>
            </div>
        </div>
    )
}