import EditIcon from "@components/icons/edit";
import { type Redirect } from "@prisma/client";
import Link from "next/link";

export default function RedirectTableRow ({
    redirect,
    showActions = true,
    className
} : {
    redirect: Redirect
    showActions?: boolean
    className?: string
}) {
    const editLink = `/admin/redirect/edit/${redirect.id.toString()}`;

    return (
        <tr className={className}>
            <td>{redirect.url}</td>
            <td>{redirect.redirect}</td>
            {showActions && (
                <td>
                    <Link
                        href={editLink}
                        className="btn btn-primary flex justify-center items-center h-8 w-8"
                    >
                        <EditIcon className="fill-white" />
                    </Link>
                </td>
            )}
        </tr>
    )
}