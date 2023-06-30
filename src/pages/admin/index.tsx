import { type GetServerSidePropsContext, type NextPage } from "next";
import React, { useState } from "react";

import { BestModsPage } from '../../components/main';
import HeadInfo from "../../components/head";

import { AlertForm } from '../../components/utils/alert';

import { trpc } from '../../utils/trpc';

import Link from 'next/link';

import { prisma } from "../../server/db/client";
import { type CategoriesWithChildren } from "../../components/types";
import { type Source } from "@prisma/client";
import { getSession } from "next-auth/react";
import { Has_Perm } from "../../utils/permissions";

import EditIcon from "../../components/utils/icons/edit";
import DeleteIcon from "../../components/utils/icons/delete";

const Home: NextPage<{
    authed: boolean,
    cats: CategoriesWithChildren[],
    srcs: Source[]
}> = ({
    authed,
    cats,
    srcs
}) => {
    return (
        <>
            <HeadInfo />
            <BestModsPage>
                {authed ? (
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
            </BestModsPage>
        </>
    );
};

const Categories: React.FC<{
    cats: CategoriesWithChildren[]
}> = ({
    cats
}) => {
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";

    const [success, setSuccess] = useState<string | null>(null);

    const delCats = trpc.category.delCategory.useMutation();

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
                                    <img src={icon} alt="Category Icon" />
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
                                                    <img src={iconChild} className="w-8 h-8" alt="Category Child Icon" />
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
                <Link href="/admin/add/category">Add Category!</Link>
            </div>
        </div>
    );
}

const Sources: React.FC<{
    srcs: Source[]
}> = ({
    srcs
}) => {
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";

    const [success, setSuccess] = useState<string | null>(null);

    const delSrcs = trpc.source.delSource.useMutation();

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
                                    <img src={icon} alt="Source Icon" />
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
                <Link href="/admin/add/source">Add Source!</Link>
            </div>
        </div>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    let authed = false;
    let cats: CategoriesWithChildren[] = [];
    let srcs: Source[] = [];

    const session = await getSession(ctx);

    const perm_check = session && (Has_Perm(session, "admin") || Has_Perm(session, "contributor"));

    if (session?.user && perm_check)
        authed = true;

    if (authed) {
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
            authed: authed,
            cats: cats,
            srcs: srcs
        }
    };
}

export default Home;