import { useContext, useState } from "react";
import { trpc } from "../../../utils/trpc";
import { Field, Form, Formik } from "formik";

import { UserRole, type User } from "@prisma/client";

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
                    <h2>Roles</h2>
                    <Roles user={user} />
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

const Roles: React.FC<{
    user: User | null
}> = ({
    user
}) => {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Mutations.
    const addRole = trpc.user.addRole.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Error Adding Role!");
                errorCtx.setMsg("There was an error adding this role. Please check the console!");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Added Role!");
                successCtx.setMsg("The role was added successfully!");

                ScrollToTop();
            }
        }
    });

    const delRole = trpc.user.delRole.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Error Removing Role!");
                errorCtx.setMsg("There was an error removing this role. Please check the console!");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Removed Role!");
                successCtx.setMsg("The role was removed successfully!");

                ScrollToTop();
            }
        }
    });

    const [role, setRole] = useState<UserRole>("CONTRIBUTOR");

    return (
        <div className="p-2 flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {user?.roles?.map((role, index) => {
                    return (
                        <button 
                            key={`role-${index.toString()}`}
                            onClick={(e) => {
                                e.preventDefault();
                                
                                delRole.mutate({
                                    id: user.id,
                                    role: role
                                });
                            }}
                            className="btn btn-secondary"
                        >{role}</button>
                    );
                })}
            </div>
            <div className="bg-bestmods-3/80 rounded p-2 flex flex-wrap gap-2">
                <label>Role</label>
                <select
                    onChange={(e) => {
                        const val = e.target.value;

                        if (val == "0")
                            setRole("CONTRIBUTOR");
                        else if (val == "1")
                            setRole("ADMIN");
                    }}
                >
                    <option value="0">Contributor</option>
                    <option value="1">Admin</option>
                </select>
                <button
                    className="btn btn-primary"
                    onClick={(e) => {
                        e.preventDefault();


                        if (user) {
                            addRole.mutate({
                                id: user.id,
                                role: role
                            });
                        }
                    }}
                >Add!</button>
            </div>
        </div>
    )
}