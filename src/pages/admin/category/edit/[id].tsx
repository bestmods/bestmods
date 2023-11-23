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
import { type Category } from "@prisma/client";
import NotFound from "@components/errors/notfound";

export default function Page ({
    category,
    categories
} : {
    category?: Category
    categories: CategoryWithChildren[]
}) {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title={`Editing Category ${category?.name ?? "N/A"} - Best Mods`}
            />
            <Main>
                {Has_Perm(session, "admin") ? (
                    <>
                        {category ? (
                            <CategoryForm
                                category={category}
                                categories={categories}
                            />
                        ) : (
                            <NotFound item="category" />
                        )}
                    </>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params } = ctx;

    const id = params?.id?.toString();

    let category: Category | null = null;
    let categories: CategoryWithChildren[] = [];

    const session = await getServerAuthSession(ctx);

    if (Has_Perm(session, "admin") && id) {
        category = await prisma.category.findFirst({
            where: {
                id: Number(id)
            }
        })

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
            category: category,
            categories: categories
        }
    }
}