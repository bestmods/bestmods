import { type Category } from "@prisma/client";
import { GetCategoryIcon, GetCategoryUrl } from "@utils/category";
import Image from "next/image";
import Link from "next/link";
import { type CategoryWithChildren } from "~/types/category";

export default function ModViewCategory ({
    cat,
    catPar
} : {
    cat: Category | CategoryWithChildren
    catPar?: Category | CategoryWithChildren | null
}) {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    // Generate category icons and links.
    const catIcon = GetCategoryIcon(cat, cdn)
    const catParIcon = GetCategoryIcon(catPar, cdn);

    const catLink = cat ? GetCategoryUrl(cat) : "global";
    const catParLink = catPar ? GetCategoryUrl(catPar) : "global";

    return (
        <div className="flex flex-wrap gap-2">
            {catPar && (
                <>
                    <Link
                        href={catParLink}
                        className="flex flex-wrap gap-1"
                    >
                        <Image
                            src={catParIcon}
                            width={32}
                            height={32}
                            alt="Category Parent Icon"
                        />
                        <span>{catPar.name}</span>
                    </Link>
                    <span>→</span>
                </>
            )}
            <Link
                href={catLink}
                className="flex flex-wrap gap-1"
            >
                <Image
                    src={catIcon}
                    width={32}
                    height={32}
                    alt="Category Icon"
                />
                <span>{cat.name}</span>
            </Link>
        </div>
    )
}