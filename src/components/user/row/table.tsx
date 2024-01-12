import EditIcon from "@components/icons/edit";
import TrashIcon from "@components/icons/trash";
import { ErrorCtx, SuccessCtx } from "@pages/_app";
import { type User } from "@prisma/client";
import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useContext } from "react";

export default function UserRowTable ({
    user,
    showActions = true
} : {
    user: User
    showActions?: boolean
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const editLink = `/admin/user/edit/${user.id}`;

    const delMut = trpc.user.del.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Unable To Delete User!");
                errorCtx.setMsg("Unable to delete this user. Check the console!");
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Deleted User!");
                successCtx.setMsg("Deleted the user successfully!");
            }
        }   
    })

    return (
        <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            {showActions && (
                <td>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={editLink}
                            className="flex justify-center items-center btn btn-primary w-8 h-8"
                        >
                            <EditIcon className="fill-white" />
                        </Link>
                        <button
                            type="button"
                            className="btn btn-danger w-8 h-8"
                            onClick={() => {
                                const yes = confirm("Are you sure you want to delete this user?");

                                if (yes) {
                                    delMut.mutate({
                                        id: user.id
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