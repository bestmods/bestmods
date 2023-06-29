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
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="style=fill"><g id="edit"><path id="Subtract" fillRule="evenodd" clipRule="evenodd" d="M18.9405 3.12087L21.0618 5.24219C22.2334 6.41376 22.2334 8.31326 21.0618 9.48483L19.2586 11.288L12.8947 4.92403L14.6978 3.12087C15.8694 1.94929 17.7689 1.94929 18.9405 3.12087ZM11.834 5.98469L3.70656 14.1121C3.22329 14.5954 2.91952 15.2292 2.84552 15.9086L2.45151 19.5264C2.31313 20.7969 3.38571 21.8695 4.65629 21.7311L8.27401 21.3371C8.95345 21.2631 9.58725 20.9594 10.0705 20.4761L18.1979 12.3486L11.834 5.98469Z" fill="#FFFFFF" /></g></g></svg>
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
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 12H8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#FFA574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="style=fill"><g id="edit"><path id="Subtract" fillRule="evenodd" clipRule="evenodd" d="M18.9405 3.12087L21.0618 5.24219C22.2334 6.41376 22.2334 8.31326 21.0618 9.48483L19.2586 11.288L12.8947 4.92403L14.6978 3.12087C15.8694 1.94929 17.7689 1.94929 18.9405 3.12087ZM11.834 5.98469L3.70656 14.1121C3.22329 14.5954 2.91952 15.2292 2.84552 15.9086L2.45151 19.5264C2.31313 20.7969 3.38571 21.8695 4.65629 21.7311L8.27401 21.3371C8.95345 21.2631 9.58725 20.9594 10.0705 20.4761L18.1979 12.3486L11.834 5.98469Z" fill="#FFFFFF" /></g></g></svg>
                                                    </Link>
                                                    <Link href="#" onClick={(e) => {
                                                        e.preventDefault();

                                                        if (confirm("Are you sure?")) {
                                                            delCats.mutate({ id: catChild.id });

                                                            setSuccess("Deleted child category #" + catChild.id + " (" + catChild.name + ")!");
                                                        }
                                                    }}>
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 12H8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#FFA574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="style=fill"><g id="edit"><path id="Subtract" fillRule="evenodd" clipRule="evenodd" d="M18.9405 3.12087L21.0618 5.24219C22.2334 6.41376 22.2334 8.31326 21.0618 9.48483L19.2586 11.288L12.8947 4.92403L14.6978 3.12087C15.8694 1.94929 17.7689 1.94929 18.9405 3.12087ZM11.834 5.98469L3.70656 14.1121C3.22329 14.5954 2.91952 15.2292 2.84552 15.9086L2.45151 19.5264C2.31313 20.7969 3.38571 21.8695 4.65629 21.7311L8.27401 21.3371C8.95345 21.2631 9.58725 20.9594 10.0705 20.4761L18.1979 12.3486L11.834 5.98469Z" fill="#FFFFFF" /></g></g></svg>
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
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 12H8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#FFA574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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