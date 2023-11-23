import CategoryForm from "@components/forms/category/main";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import NoAccess from "@components/errors/noaccess";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import { Has_Perm } from "@utils/permissions";
import { type GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db/client";

export default function Page ({
    categories
} : {
    categories: CategoryWithChildren[]
}) {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="New Category - Best Mods"
            />
            <Main>
                {Has_Perm(session, "admin") ? (
                    <CategoryForm categories={categories} />
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    let categories: CategoryWithChildren[] = [];

    const session = await getServerAuthSession(ctx);

    if (Has_Perm(session, "admin")) {
        categories = await prisma.category.findMany({
            include: {
                children: true
            },
            where: {
                parent: null
            }
        })
    }

    return {
        props: {
            categories: categories
        }
    }
}