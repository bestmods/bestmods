import Rating from "@components/mod/rating";

import EyeIcon from "@components/icons/eye";
import DownloadIcon from "@components/icons/download";

import { type ModRowBrowser } from "~/types/mod";
import Image from "next/image";
import IconAndText from "@components/icon_and_text";
import { LimitText } from "@utils/text";
import { GetModUrl } from "@utils/mod";
import { GetCategoryIcon } from "@utils/category";

export default function ModRowTable ({
    mod
} : {
    mod: ModRowBrowser
}) {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    // General information that we may need to modify.
    const name = LimitText(mod.name, 24);
    const descShort = mod.descriptionShort ? LimitText(mod.descriptionShort, 128) : undefined;
    const ownerName = mod.ownerName ? LimitText(mod.ownerName, 24) : undefined;

    // Generate links.
    const viewLink = GetModUrl(mod);

    // Get category information.
    const catIcon = GetCategoryIcon(mod.category, cdn);

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
                    src={catIcon}
                    width={32}
                    height={32}
                    alt="Category Icon"
                    className="rounded"
                />
            </td>
            <td className="pl-3">
                {name}
            </td>
            <td className="hidden sm:table-cell">
                <p className="text-sm">{descShort}</p>
            </td>
            <td>
                {ownerName && ownerName.length > 0 && (
                    <p>By {ownerName}</p>
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
                        className="relative flex flex-col gap-1 text-center justify-center items-center"
                        invert={true}
                    />
                </div>
            </td>
        </tr>
    )
}