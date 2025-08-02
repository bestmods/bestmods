/*
import { type GetServerSidePropsContext } from "next"

import { prisma } from "@server/db/client";

import MetaInfo from "@components/meta";
import Main from "@components/main";
import { useSession } from "next-auth/react";
import ModReportForm from "@components/forms/mod/report";
import NoAccess from "@components/errors/noaccess";
import NotFound from "@components/errors/notfound";
*/

import { notFound } from "next/navigation";

type Mod = {
    id: number
    name: string
}

export default function Page ({
    //mod
} : {
    mod: Mod
}) {
    notFound()

    /*
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="Add Report - Best Mods"
                description="Report a mod here!"
            />
            <Main>
                {session ? (
                    <>
                        {mod ? (
                            <div className="flex flex-col gap-2">
                                <h2>Reporting {"'"}{mod.name}{"'"}</h2>
                                <ModReportForm
                                    modId={mod.id}
                                    className="bg-bestmods-2/80 rounded p-6"
                                />
                            </div>
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
    */
}

/*
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params, res } = ctx;

    const modId = params?.id?.toString();

    let mod: Mod | null = null;

    if (modId) {
        mod = await prisma.mod.findFirst({
            select: {
                id: true,
                name: true
            },
            where: {
                id: Number(modId)
            }
        })
    }

    if (!mod)
        res.statusCode = 404;

    return {
        props: {
            mod: mod
        }
    }
}
*/