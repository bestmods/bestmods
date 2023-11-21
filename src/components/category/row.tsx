import { type Category } from "@prisma/client";
import Link from "next/link";
import { type CategoryWithCount, type CategoryWithChildrenAndCounts } from "~/types/category";

export default function CategoryRow ({
    parent,
    cat,
    className,
    include_mod_count
} : {
    parent?: Category,
    cat: CategoryWithChildrenAndCounts | CategoryWithCount,
    className?: string,
    include_mod_count?: boolean
}) {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    const name = cat.name;
    let view_url = "/category/";

    const icon = (cat.icon) ? cdn + cat.icon : "/images/default_icon.png";

    const mod_count = cat._count?.Mod ?? 0;

    if (parent)
        view_url += parent.url + "/";

    view_url += cat.url;

    return (
        <div className={`category-row${className ? ` ${className}` : ``}`}>
            <Link href={view_url}>
                <img src={icon} alt="Category icon" />
                <span>
                    {name}

                    {include_mod_count && (
                        <span>
                            {" "}({mod_count})
                        </span>
                    )}
                </span>
            </Link>
        </div>
    )
}