import { ErrorCtx, SuccessCtx } from "@pages/_app";
import { HasRole } from "@utils/roles";
import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";
import { type CategoryWithChildrenAndCounts } from "~/types/category";

export default function CategoryRowGrid ({
    category,
    showActions = false,
    className
} : {
    category: CategoryWithChildrenAndCounts
    showActions?: boolean
    className?: string
}) {
    const { data: session } = useSession();
    
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    let banner = "/images/default_category.png";

    if (category.banner)
        banner = cdn + category.banner;

    const viewLink = `/category/${category.url}`;
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
        <div className={`bg-bestmods-2/80 shadow-lg shadow-black ring-4 ring-bestmods-3/80 hover:ring-bestmods-4/80 rounded group translate-y-0 hover:-translate-y-3 duration-300 hover:text-inherit${className ? ` ${className}` : ``}`}>
            <div className="w-full h-64">
                <Link href={viewLink}>
                    <Image
                        src={banner}
                        width={720}
                        height={360}
                        alt="Category Banner"
                        className="w-full h-full brightness-[70%] group-hover:brightness-100 group-hover:duration-300 object-cover"
                    />
                </Link>
            </div>
            <div className="p-4">
                <Link href={viewLink}>
                    <h2 className="text-center">{category.name}</h2>
                </Link>
            </div>
            <div className="p-4 grow">
                {totalMods < 1 && (
                    <p>No Mods</p>
                )}
                {totalMods == 1 && (
                    <p>1 Mod</p>
                )}
                {totalMods > 1 && (
                    <p>{totalMods.toString()} Mods</p>
                )}
            </div>
            {(showActions && (HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR"))) && (
                <div className="flex gap-2 justify-center items-center">
                    <Link
                        href={editLink}
                        className="btn btn-primary"
                    >Edit</Link>
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => {
                            const yes = confirm("Are you sure you want to delete this category?");

                            if (yes) {
                                delMut.mutate({
                                    id: category.id
                                })
                            }
                        }}
                    >Delete</button>
                </div>
            )}
            {category.children.length > 0 && (
                <div className="flex flex-wrap gap-4 p-4">
                    {category.children.map((child, index) => {
                        const viewLink = `/category/${category.url}/${child.url}`;

                        return (
                            <Link
                                key={`child-${index.toString()}`}
                                href={viewLink}
                                className="p-2"
                            >
                                <span>{child.name} ({child._count.Mod.toString()})</span>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}