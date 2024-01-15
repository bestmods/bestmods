import EditIcon from "@components/icons/edit";
import TrashIcon from "@components/icons/trash";
import { ErrorCtx, SuccessCtx } from "@pages/_app";
import { type Redirect } from "@prisma/client";
import ScrollToTop from "@utils/scroll";
import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useContext } from "react";

export default function RedirectTableRow ({
    redirect,
    showActions = true,
    className
} : {
    redirect: Redirect
    showActions?: boolean
    className?: string
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const editLink = `/admin/redirect/edit/${redirect.id.toString()}`;

    const delMut = trpc.redirect.del.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Delete Redirect");
                errorCtx.setMsg("There was an error deleting this redirect. Check the console for more details.")

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Successfully Deleted Redirect!");
                successCtx.setMsg("Successfully deleted redirect!");

                ScrollToTop();
            }
        }
    })

    return (
        <tr className={className}>
            <td>
                <Link href={redirect.url}>{redirect.url}</Link>
            </td>
            <td>
                <Link href={redirect.redirect}>{redirect.redirect}</Link>
            </td>
            {showActions && (
                <td>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={editLink}
                            className="btn btn-primary h-8 w-8"
                        >
                            <EditIcon className="fill-white" />
                        </Link>
                        <button
                            type="button"
                            className="btn btn-danger h-8 w-8"
                            onClick={() => {
                                const yes = confirm("Are you sure you want to delete this redirect?");

                                if (yes) {
                                    delMut.mutate({
                                        id: redirect.id
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