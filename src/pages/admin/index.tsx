import React, { useContext, useState } from "react";
import { type GetServerSidePropsContext } from "next";
import Link from "next/link";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { type CategoryWithChildren } from "~/types/category";
import { type Source } from "@prisma/client";

import { prisma } from "../../server/db/client";
import { getSession, useSession } from "next-auth/react";

import { trpc } from "@utils/trpc";
import { HasPerm } from "@utils/permissions";

import EditIcon from "@components/icons/edit";
import DeleteIcon from "@components/icons/delete";
import NoAccess from "@components/errors/noaccess";
import IconAndText from "@components/icon_and_text";
import { ErrorCtx, SuccessCtx } from "@pages/_app";
import ScrollToTop from "@utils/scroll";

export default function Page ({
    cats,
    srcs
} : {
    cats: CategoryWithChildren[],
    srcs: Source[]
}) {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo />
            <Main>
                {HasPerm(session, "admin") ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-items-center">
                        <div className="p-4 bg-bestmods-2/80 rounded">
                            <h2>View Users</h2>
                            <p>View and modify users <Link href="/admin/user/">here!</Link></p>
                        </div>
                        <div className="p-4 bg-bestmods-2/80 rounded">
                            <h2>Categories</h2>
                            <Categories cats={cats} />
                        </div>
                        <div className="p-4 bg-bestmods-2/80 rounded">
                            <h2>Sources</h2>
                            <Sources srcs={srcs} />
                        </div>
                    </div>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}

const Categories: React.FC<{
    cats: CategoryWithChildren[]
}> = ({
    cats
}) => {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const delCats = trpc.category.del.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Unable To Delete Category!");
                errorCtx.setMsg("Unable to remove category. Check the console!");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Removed Category!");
                successCtx.setMsg("Removed the category successfully!");

                ScrollToTop();
            }
        }
    });

    return (
        <div className="flex flex-col gap-2">
            {cats.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {cats.map((cat, index) => {
                        // Generate links.
                        const editLink = `/admin/category/edit/${cat.id.toString()}`;

                        // Retrieve icon.
                        let icon = "/images/default_icon.png";

                        if (cat.icon)
                            icon = cdn + cat.icon;

                        return (
                            <div
                                key={`cat-${index.toString()}`}
                                className="p-1"
                            >
                                <div className="flex flex-wrap gap-2">
                                    <IconAndText
                                        icon={icon}
                                        text={<span>{cat.name}</span>}
                                    />
                                
                                    <Link
                                        href={editLink}
                                        className="btn btn-primary p-1"
                                    >
                                        <EditIcon className="w-4 h-4 stroke-white" />
                                    </Link>
                                    <button
                                        className="btn btn-danger p-1"
                                        onClick={(e) => {
                                            e.preventDefault();

                                            if (confirm("Are you sure?")) {
                                                delCats.mutate({
                                                    id: cat.id
                                                });
                                            }
                                        }}
                                    >
                                        <DeleteIcon className="w-4 h-4 stroke-white" />
                                    </button>
                                </div>
                                {cat.children.length > 0 && (
                                    <ul className="flex flex-col gap-1 p-2">
                                        {cat.children.map((child, index) => {
                                            const editLink = `/admin/category/edit/${child.id.toString()}`;

                                            let icon = "/images/default_icon.png";

                                            if (child.icon)
                                                icon = cdn + child.icon;

                                            return (
                                                <li
                                                    key={`child-${index.toString()}`}
                                                    className="pl-5 flex flex-wrap gap-2"
                                                >
                                                    <IconAndText
                                                        icon={icon}
                                                        text={<span>{child.name}</span>}
                                                    />
                                                    <Link
                                                        href={editLink}
                                                        className="btn btn-primary p-1"
                                                    >
                                                        <EditIcon className="w-4 h-4 stroke-white" />
                                                    </Link>
                                                    <button
                                                        className="btn btn-danger p-1"
                                                        onClick={(e) => {
                                                            e.preventDefault();

                                                            if (confirm("Are you sure?")) {
                                                                delCats.mutate({ id: child.id });
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon className="w-4 h-4 stroke-white" />
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p>No categories found.</p>
            )}
            <div className="flex justify-center">
                <Link
                    className="btn btn-primary" 
                    href="/admin/add/category"
                >Add Category!</Link>
            </div>
        </div>
    )
}

const Sources: React.FC<{
    srcs: Source[]
}> = ({
    srcs
}) => {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const delSrcs = trpc.source.del.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Unable To Delete Source!");
                errorCtx.setMsg("An error occurred when deleting source. Check the console!");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Deleted Source!");
                successCtx.setMsg("Deleted the source successfully!");

                ScrollToTop();
            }
        }
    });

    return (
        <div className="flex flex-col gap-2">
            {srcs.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {srcs.map((src, index) => {
                        const editLink = `/admin/source/edit/${src.url}`;
                        
                        let icon = "/images/default_icon.png";

                        if (src.icon)
                            icon = cdn + src.icon;

                        return (
                            <div
                                key={`source-${index.toString()}`}
                                className="flex flex-wrap gap-2"
                            >
                                <IconAndText
                                    icon={icon}
                                    text={<>{src.name}</>}
                                />
                                <Link
                                    href={editLink}
                                    className="btn btn-primary p-1"
                                >
                                    <EditIcon className="w-4 h-4 stroke-white" />
                                </Link>
                                <button
                                    className="btn btn-danger p-1"
                                    onClick={(e) => {
                                        e.preventDefault();

                                        if (confirm("Are you sure?")) {
                                            delSrcs.mutate({
                                                url: src.url
                                            });
                                        }
                                    }}
                                >
                                    <DeleteIcon className="w-4 h-4 stroke-white" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p>No sources found.</p>
            )}
            <div className="flex justify-center">
                <Link
                    className="btn btn-primary" 
                    href="/admin/add/source"
                >Add Source!</Link>
            </div>
        </div>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    let cats: CategoryWithChildren[] = [];
    let srcs: Source[] = [];

    const session = await getSession(ctx);

    const perm_check = HasPerm(session, "admin") || HasPerm(session, "contributor");

    if (perm_check) {
        cats = await prisma.category.findMany({
            where: {
                parentId: null
            },
            include: {
                children: true
            }
        });

        srcs = await prisma.source.findMany();
    }

    return {
        props: {
            cats: cats,
            srcs: srcs
        }
    }
}