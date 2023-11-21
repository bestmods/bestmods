import Main from "@components/main";
import MetaInfo from "@components/meta";
import NoAccess from "@components/responses/noaccess";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import { Has_Perm } from "@utils/permissions";
import { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";

import { prisma } from "@server/db/client";
import { Source } from "@prisma/client";
import SourceForm from "@components/forms/contributor/create_source";

export default function Page ({
    source
} : {
    source?: Source
}) {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title={`Editing Source ${source?.name ?? "N/A"} - Best Mods`}
            />
            <Main>
                {Has_Perm(session, "admin") ? (
                    <SourceForm src={source} />
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params } = ctx;

    const url = params?.url?.toString();
    
    let source: Source | null = null;

    const session = await getServerAuthSession(ctx);

    if (Has_Perm(session, "admin") && url) {
        source = await prisma.source.findFirst({
            where: {
                url: url
            }
        })
    }

    return {
        props: {
            source: source
        }
    }
}