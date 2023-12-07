import Main from "@components/main";
import MetaInfo from "@components/meta";
import NoAccess from "@components/errors/noaccess";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import { HasPerm } from "@utils/permissions";
import { type GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db/client";
import { type Source } from "@prisma/client";
import ModForm from "@components/forms/mod/main";

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
                <div className="flex flex-col gap-2">
                    {HasPerm(session, "admin") ? (
                        <>
                            <h1>Add Mod</h1>
                            <ModForm
                                categories={categories}
                                sources={sources}
                            />
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
    let sources: Source[] = [];

    const session = await getServerAuthSession(ctx);

    if (HasPerm(session, "admin")) {
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