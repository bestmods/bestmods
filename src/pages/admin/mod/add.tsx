import Main from "@components/main";
import MetaInfo from "@components/meta";
import NoAccess from "@components/responses/noaccess";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import { Has_Perm } from "@utils/permissions";
import { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db/client";
import { Source } from "@prisma/client";
import ModForm from "@components/forms/contributor/create_mod";

export default function Page ({
    categories,
    sources
} : {
    categories: CategoryWithChildren[]
    sources: Source[]
}) {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="New Mod - Best Mods"
            />
            <Main>
                {Has_Perm(session, "admin") ? (
                    <ModForm
                        cats={categories}
                        srcs={sources}
                    />
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    let categories: CategoryWithChildren[] = [];
    let sources: Source[] = [];

    const session = await getServerAuthSession(ctx);

    if (Has_Perm(session, "admin")) {
        categories = await prisma.category.findMany({
            include: {
                children: true
            },
            where: {
                parent: null
            }
        });

        sources = await prisma.source.findMany();
    }

    return {
        props: {
            categories: categories,
            sources: sources
        }
    }
}