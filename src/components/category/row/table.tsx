import EditIcon from "@components/icons/edit";
import TrashIcon from "@components/icons/trash";
import { ErrorCtx, SuccessCtx } from "@pages/_app";
import { HasRole } from "@utils/roles";
import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useContext } from "react";
import { type CategoryWithChildrenAndCounts } from "~/types/category";

export default function CategoryRowTable ({
    category,
    showActions = false,
    className,
    childClassName
} : {
    category: CategoryWithChildrenAndCounts
    showActions?: boolean
    className?: string
    childClassName?: string
}) {
    const { data: session } = useSession();

    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const parent = category.parent;

    const viewLink = `/category/${parent ? `${parent.url}/` : ``}${category.url}`
    const editLink = `/admin/category/edit/${category.id.toString()}`;

    // Get total mods for this category.
    let totalMods = category._count.Mod;

    // Add children mod counts.
    category.children.map(child => totalMods += child._count.Mod)

    // Handle deletion mutation.
    const delMut = trpc.category.del.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Error Deleting Category");
                errorCtx.setMsg("There was an error deleting this category. Please check the console.");
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Deleted Category!");
                successCtx.setMsg("Successfully deleted category!");
            }
        }
    })

    return (
        <>
            <tr className={className}>
                <td>{category.id.toString()}</td>
                <td>
                    <Link href={viewLink}>{category.name}</Link>
                </td>
                <td>{category.url}</td>
                <td>{totalMods.toString()}</td>
                {(showActions && (HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR"))) && (
                    <td>
                        <div className="flex gap-2">
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
                                    const yes = confirm("Are you sure you want to delete this category?");

                                    if (yes) {
                                        delMut.mutate({
                                            id: category.id
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
            {category.children.map((child, index) => {
                const totalMods = child._count.Mod;

                const viewLink = `/category/${category.url}/${child.url}`
                const editLink = `/admin/category/edit/${child.id.toString()}`;

                return (
                    <tr
                        key={`child-${index.toString()}`}
                        className={childClassName}
                    >
                        <td>{child.id.toString()}</td>
                        <td>
                            <Link href={viewLink}>{child.name}</Link>
                        </td>
                        <td>{child.url}</td>
                        <td>{totalMods.toString()}</td>
                        {(showActions && (HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR"))) && (
                            <td>
                                <div className="flex gap-2">
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
                                            const yes = confirm("Are you sure you want to delete this category?");

                                            if (yes) {
                                                delMut.mutate({
                                                    id: child.id
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
            })}
        </>
    )
}