import CategoryForm from "@components/forms/category/main";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import NoAccess from "@components/errors/noaccess";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import { HasRole } from "@utils/roles";
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
                <div className="flex flex-col gap-2">
                    {HasRole(session, "ADMIN") ? (
                        <>
                            <h1>Add Category</h1>
                            <CategoryForm categories={categories} />
                        </>
                    ) : (
                        <NoAccess />
                    )}
                </div>
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    let categories: CategoryWithChildren[] = [];

    const session = await getServerAuthSession(ctx);

    if (HasRole(session, "ADMIN")) {
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