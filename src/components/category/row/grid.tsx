import Image from "next/image";
import Link from "next/link";
import { type CategoryWithChildrenAndCounts, type CategoryWithCount } from "~/types/category";

export default function CategoryRowGrid ({
    category,
    children = []
} : {
    category: CategoryWithChildrenAndCounts
    children: CategoryWithCount[]
}) {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    let banner = "/images/default_category.png";

    if (category.banner)
        banner = cdn + category.banner;

    const viewLink = `/category/${category.url}`;

    const modCnt = category._count.Mod;

    return (
        <div
            onClick={() => {
                if (typeof window !== "undefined")
                    window.location.href = viewLink;  
            }}
            className="bg-bestmods-2/80 cursor-pointer group translate-y-0 hover:-translate-y-3 duration-300"
        >
            <div className="w-full h-64">
                <Image
                    src={banner}
                    width={256}
                    height={128}
                    alt="Category Banner"
                    className="w-full h-full brightness-[70%] group-hover:brightness-100 group-hover:duration-300"
                />
            </div>
            <div className="p-4">
                <h2 className="text-center">{category.name}</h2>
            </div>
            <div className="p-4 grow">
                {modCnt < 1 && (
                    <p>No Mods</p>
                )}
                {modCnt == 1 && (
                    <p>1 Mod</p>
                )}
                {modCnt > 1 && (
                    <p>{modCnt.toString()} Mods</p>
                )}
            </div>
            {children.length > 0 && (
                <div className="flex flex-wrap gap-4 p-4">
                    {children.map((child, index) => {
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