import { HasRole } from "@utils/roles";
import { useSession } from "next-auth/react";
import { type ModRowBrowser, type ModViewItem } from "~/types/mod";

export default function ModDebug ({
    mod
} : {
    mod: ModViewItem | ModRowBrowser
}) {
    const { data: session } = useSession();

    return (
        <>
            {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) && (
                <div className="flex justify-center py-2">
                    <div className="flex flex-col gap-1">
                        <span className="italic text-xs">Mod ID - {mod.id.toString()}</span>
                    </div>
                </div>
            )}
        </>
    )
}