import EditIcon from "@components/icons/edit";
import TrashIcon from "@components/icons/trash";
import { ErrorCtx, SuccessCtx } from "@pages/_app";
import { type Source } from "@prisma/client";
import { HasRole } from "@utils/roles";
import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useContext } from "react";

export default function SourceRowTable ({
    source,
    className,
    showActions = false
} : {
    source: Source
    className?: string
    showActions?: boolean
}) {
    const { data: session } = useSession();

    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const editLink = `/admin/source/edit/${source.url}`;

    const delMut = trpc.source.del.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);
            
            if (errorCtx) {
                errorCtx.setTitle("Error Deleting Source");
                errorCtx.setMsg("Error deleting source. Please check your console.");
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Deleted Source!");
                successCtx.setMsg("Successfully deleted source!");
            }
        }
    })

    return (
        <tr className={className}>
            <td>{source.name}</td>
            <td>{source.url}</td>
            {(showActions && (HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR"))) && (
                <td>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={editLink}
                            className="btn btn-primary w-8 h-8"
                        >
                            <EditIcon className="fill-white" />
                        </Link>
                        <button
                            type="button"
                            className="btn btn-danger w-8 h-8"
                            onClick={() => {
                                const yes = confirm("Are you sure you want to delete this source?");

                                if (yes) {
                                    delMut.mutate({
                                        url: source.url
                                    })
                                }
                            }}
                        >
                            <TrashIcon className="fill-white" />
                        </button>
                    </div>
                </td>
            )}
        </tr>
    )
}