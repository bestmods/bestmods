import Link from "next/link";

import Rating from "@components/mod/rating";

import EyeIcon from "@components/icons/eye";
import DownloadIcon from "@components/icons/download";

import { type Category } from "@prisma/client";
import { type ModRowBrowser } from "~/types/mod";
import Image from "next/image";
import IconAndText from "@components/icon_and_text";

export default function ModRowTable ({
    mod,
    banner,
    descShort,
    cat,
    catPar,
    catParIcon,
    catParLink,
    catIcon,
    catLink,
    viewLink
} : {
    mod: ModRowBrowser,
    banner: string,
    descShort: string,
    cat?: Category | null,
    catPar?: Category | null,
    catParIcon: string,
    catParLink: string | null,
    catIcon: string,
    catLink: string | null,
    viewLink: string
}) {
    const cdn: string | undefined = process.env.NEXT_PUBLIC_CDN_URL;

    return (
        <tr
            className="bg-bestmods-2/80 hover:bg-bestmods-3/80 hover:duration-300 cursor-pointer"
            onClick={() => {
                if (typeof window !== "undefined")
                    window.location.href = viewLink;
            }}
        >
            <td className="w-8 h-8">
                <Image
                    src={cdn + catIcon}
                    width={32}
                    height={32}
                    alt="Category Icon"
                    className="rounded"
                />
            </td>
            <td className="pl-3">
                {mod.name}
            </td>
            <td>
                <p className="text-sm">{descShort}</p>
            </td>
            <td>
                {mod.ownerName && mod.ownerName.length > 0 && (
                    <p>By {mod.ownerName}</p>
                )}
            </td>
            <td>
                <div className="flex flex-col gap-1">
                    <IconAndText
                        icon={<EyeIcon className="w-4 h-4 stroke-white" />}
                        text={<>{mod.totalViews.toString()}</>}
                    />
                    <IconAndText
                        icon={<DownloadIcon className="w-4 h-4 stroke-white" />}
                        text={<>{mod.totalDownloads.toString()}</>}
                    />
                </div>
            </td>
            <td>
                <div>
                    <Rating
                        mod={mod}
                        rating={mod.rating}
                    />
                </div>
            </td>
        </tr>
    )
}