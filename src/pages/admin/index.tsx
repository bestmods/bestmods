import React, { useState } from "react";
import { type GetServerSidePropsContext } from "next";
import Link from "next/link";

import Main from "@components/main";
import MetaInfo from "@components/meta";

import { type CategoryWithChildren } from "~/types/category";
import { type Source } from "@prisma/client";

import { prisma } from "../../server/db/client";
import { getSession, useSession } from "next-auth/react";

import { trpc } from "@utils/trpc";
import { Has_Perm } from "@utils/permissions";
import { AlertForm } from "@utils/alert";

import EditIcon from "@components/icons/edit";
import DeleteIcon from "@components/icons/delete";
import Image from "next/image";

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
                {Has_Perm(session, "admin") ? (
                    <div className="admin-index-container">
                        <div>
                            <div>
                                <h3>View Users</h3>
                                <p>View and modify users <Link href="/admin/user/">here!</Link></p>
                            </div>
                        </div>
                        <div>
                            <Categories cats={cats} />
                        </div>
                        <div>
                            <Sources srcs={srcs} />
                        </div>
                    </div>
                ) : (
                    <div className="unauthorized-div">
                        <p>You are not authorized to view this page.</p>
                    </div>
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
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";

    const [success, setSuccess] = useState<string | undefined>(undefined);

    const delCats = trpc.category.del.useMutation();

    return (
        <div>
            <AlertForm
                success={success}
            />

            <h3>Categories</h3>

            {cats.length > 0 ? (
                <>
                    {cats.map((cat) => {
                        const editLink = "/admin/add/category/" + cat.id;
                        const icon = (cat.icon) ? cdn + cat.icon : cdn + "/images/default_icon.png"

                        return (
                            <div key={"cat-" + cat.id} className="admin-index-category">
                                <div>
                                    <Image
                                        src={icon}
                                        width={32}
                                        height={32}
                                        alt="Category Icon"
                                    />
                                    <span>{cat.name}</span>
                                    <Link href={editLink} className="text-white hover:text-cyan-800 ml-2">
                                        <EditIcon />
                                    </Link>
                                    <Link href="#" onClick={(e) => {
                                        e.preventDefault();

                                        if (confirm("Are you sure?")) {
                                            delCats.mutate({
                                                id: cat.id
                                            });

                                            setSuccess("Deleted category #" + cat.id + " (" + cat.name + ")!");
                                        }
                                    }}>
                                        <DeleteIcon />
                                    </Link>
                                </div>
                                {cat.children.length > 0 && (
                                    <>
                                        {cat.children.map((catChild) => {
                                            const editLinkChild = "/admin/add/category/" + catChild.id;
                                            const iconChild = (catChild.icon) ? cdn + catChild.icon : cdn + "/images/default_icon.png";

                                            return (
                                                <div key={"catchild-" + catChild.id}>
                                                    <Image
                                                        src={iconChild}
                                                        width={32}
                                                        height={32}
                                                        className="w-8 h-8" 
                                                        alt="Category Child Icon"
                                                    />
                                                    <span className="text-white ml-2">{catChild.name}</span>
                                                    <Link href={editLinkChild}>
                                                        <EditIcon />
                                                    </Link>
                                                    <Link href="#" onClick={(e) => {
                                                        e.preventDefault();

                                                        if (confirm("Are you sure?")) {
                                                            delCats.mutate({ id: catChild.id });

                                                            setSuccess("Deleted child category #" + catChild.id + " (" + catChild.name + ")!");
                                                        }
                                                    }}>
                                                        <DeleteIcon />
                                                    </Link>
                                                </div>
                                            )
                                        })}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </>
            ) : (
                <p className="text-white">No categories found.</p>
            )}
            <div className="admin-index-add">
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
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";

    const [success, setSuccess] = useState<string | undefined>(undefined);

    const delSrcs = trpc.source.del.useMutation();

    return (
        <div>
            <AlertForm
                success={success}
            />

            <h3>Sources</h3>

            {srcs.length > 0 ? (
                <>
                    {srcs.map((src) => {
                        const editLink = "/admin/add/source/" + src.url;
                        const icon = (src.icon) ? cdn + src.icon : cdn + "/images/default_icon.png"

                        return (
                            <div key={"src-" + src.url} className="admin-index-category">
                                <div>
                                    <Image
                                        src={icon}
                                        width={32}
                                        height={32}
                                        alt="Source Icon"
                                    />
                                    <span>{src.name}</span>
                                    <Link href={editLink}>
                                        <EditIcon />
                                    </Link>
                                    <Link href="#" onClick={(e) => {
                                        e.preventDefault();

                                        if (confirm("Are you sure?")) {
                                            delSrcs.mutate({
                                                url: src.url
                                            });

                                            setSuccess("Deleted source '" + src.url + "' (" + src.name + ")!");
                                        }
                                    }}>
                                        <DeleteIcon />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </>
            ) : (
                <p className="text-white">No sources found.</p>
            )}
            <div className="admin-index-add">
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

    const perm_check = Has_Perm(session, "admin") || Has_Perm(session, "contributor");

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