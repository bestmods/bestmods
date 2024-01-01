import { ErrorCtx, SuccessCtx } from "@pages/_app";
import { HasRole } from "@utils/roles";
import ScrollToTop from "@utils/scroll";
import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useContext, useState } from "react";
import { type ModRowBrowser, type ModViewItem } from "~/types/mod";

export default function ModActions ({
    mod
} : {
    mod: ModViewItem | ModRowBrowser
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const { data: session } = useSession();

    // Mod actions.
    const modVisibilityMut = trpc.mod.setVisibility.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Error Setting Mod Visibility");
                errorCtx.setMsg("There was an error setting the mod's visibility! Please check the console.")
            }
        }
    });
    const [modVisible, setModVisible] = useState(mod.visible);
    const editLink = `/admin/mod/edit/${mod.id.toString()}`;

    const modDelMut = trpc.mod.del.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Error Deleting Mod");
                errorCtx.setMsg("There was an error deleting this mod. Please check the console for more details.");
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Deleted Mod Successfully!");
                successCtx.setMsg("Successfully deleted mod!");

                ScrollToTop();
            }
        }
    })

    return (
        <>
            {(HasRole(session, "ADMIN") && HasRole(session, "CONTRIBUTOR")) && (
                <div className="p-2 flex flex-wrap justify-center gap-4">
                    <Link
                        href={editLink}
                        className="btn btn-primary"
                    >Edit</Link>
                    <button
                        type="button"
                        className={`btn ${modVisible ? "btn-danger" : "btn-secondary"}`}
                        onClick={() => {
                            modVisibilityMut.mutate({
                                id: mod.id,
                                visible: !modVisible
                            })
                            setModVisible(!modVisible);
                        }}>
                        {modVisible ? "Hide" : "Show"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => {
                            const yes = confirm("Are you sure you want to delete this mod?");

                            if (yes) {
                                modDelMut.mutate({
                                    id: mod.id
                                })
                            }
                        }}
                    >Delete</button>
                </div>
            )}
        </>
    )
}