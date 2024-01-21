import { type Category } from "@prisma/client";
import { GetCategoryBanner } from "@utils/category";
import Image from "next/image";
import Link from "next/link";
import { type CategoryWithChildrenAndCounts, type CategoryWithChildrenAndParent, type CategoryWithCount } from "~/types/category";

import { Comfortaa, Baloo_2 } from "next/font/google";

const comfortaa = Comfortaa({
    subsets: ["cyrillic"],
    weight: "700"
})

const baloo2 = Baloo_2({
    subsets: ["devanagari"],
    weight: "400"
})

export default function IndexInfo ({
    category,
    modCnt = 0
} : {
    category?: CategoryWithChildrenAndParent | CategoryWithChildrenAndCounts | CategoryWithCount | Category
    modCnt: number
}) {
    const banner = category?.banner ? GetCategoryBanner(category) : null;

    let name = category?.name;

    if (category && "parent" in category && category?.parent && name)
        name = `${category.parent.name} ${name}`;

    return (
        <div className="w-full py-8 px-4 text-center bg-bestmods-2/60 rounded-lg">
            <div className="relative z-20 flex flex-col gap-2">
                <div className="flex flex-col items-center gap-1">
                    {banner && (
                        <Image
                            src={banner}
                            width={1920}
                            height={1080}
                            priority={true}
                            className="max-h-full w-96 sm:w-[32rem] max-w-full rounded-md"
                            alt="Category banner"
                        />
                    )}
                    <h3 className={`text-white text-3xl pb-2 ${comfortaa.className}`}>
                        {name ? (
                            <>{name} Mods</>
                        ) : (
                            <>A Global Mod Index</>
                        )}
                    </h3>
                </div>
                
                <p className={`text-lg text-gray-50 ${baloo2.className}`}>Find your favorite {name ? `${name} ` :  ""}mods all in one place from multiple sources on the Internet!</p>
                <p className={`text-lg text-gray-50 ${baloo2.className}`}>Currently tracking <span className="text-blue-300 font-bold text-xl">{modCnt.toString()}</span> mods.</p>
                {!category && (
                    <div className="flex justify-center pt-4">
                            <Link
                                href="/browse"
                                className="btn btn-secondary w-auto !p-4 bg-blue-200"
                            >Browse!</Link>
                    </div>
                )}
            </div>
        </div>
    )
}