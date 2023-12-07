import Main from "@components/main";
import MetaInfo from "@components/meta";
import NoAccess from "@components/errors/noaccess";
import { HasPerm } from "@utils/permissions";
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
                <div className="flex flex-col gap-2">
                    {HasPerm(session, "admin") ? (
                        <>
                            <h1>Add Source</h1>
                            <SourceForm  />
                        </>
                    ) : (
                        <NoAccess />
                    )}
                </div>
            </Main>
        </>
    )
}