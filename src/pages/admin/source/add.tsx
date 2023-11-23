import Main from "@components/main";
import MetaInfo from "@components/meta";
import NoAccess from "@components/errors/noaccess";
import { Has_Perm } from "@utils/permissions";
import { useSession } from "next-auth/react";

import SourceForm from "@components/forms/source/main";

export default function Page () {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="New Source - Best Mods"
            />
            <Main>
                {Has_Perm(session, "admin") ? (
                    <SourceForm  />
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}