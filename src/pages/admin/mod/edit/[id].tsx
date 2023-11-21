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
import { ModWithRelations } from "~/types/mod";
import NotFound from "@components/responses/notfound";

export default function Page ({
    mod,
    categories,
    sources
} : {
    mod?: ModWithRelations
    categories: CategoryWithChildren[]
    sources: Source[]
}) {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title={`Editing Mod ${mod?.name ?? "N/A"}  - Best Mods`}
            />
            <Main>
                {Has_Perm(session, "admin") ? (
                    <>
                        {mod ? (
                            <ModForm
                                mod={mod}
                                cats={categories}
                                srcs={sources}
                            />
                        ) : (
                            <NotFound item="mod" />
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

    let mod: ModWithRelations | null = null;
    let categories: CategoryWithChildren[] = [];
    let sources: Source[] = [];

    const session = await getServerAuthSession(ctx);

    if (Has_Perm(session, "admin") && id) {
        mod = await prisma.mod.findFirst({
            include: {
                category: true,
                ModDownload: true,
                ModScreenshot: true,
                ModSource: true,
                ModInstaller: true,
                ModCredit: true
            },
            where: {
                id: Number(id)
            }
        });

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
            mod: mod,
            categories: categories,
            sources: sources
        }
    }
}