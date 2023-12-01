import { type Category } from "@prisma/client";

import Rating from "@components/mod/rating";

import DropDown, { type Drop_Down_Menu_Type } from "@components/drop_down";
import Link from "next/link";

import EyeIcon from "@components/icons/eye";
import DownloadIcon from "@components/icons/download";
import { type ModRowBrowser } from "~/types/mod";
import Image from "next/image";
import IconAndText from "@components/icon_and_text";

export default function ModRowGrid ({
    mod,
    className,
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
    className?: string
    banner: string
    descShort: string
    cat?: Category | null
    catPar?: Category | null
    catParIcon: string
    catParLink: string | null
    catIcon: string
    catLink: string | null
    viewLink: string
}) {
    const cdn: string | undefined = process.env.NEXT_PUBLIC_CDN_URL;

    // Compile installer drop-down items.
    const installer_items: Drop_Down_Menu_Type[] = [];

    mod.ModInstaller?.map((ins) => {
        const name = ins.source.name;
        const url = ins.url;

        let icon = ins.source.icon ?? undefined;

        if (cdn && icon)
            icon = cdn + icon;

        const html = <>
            {icon && (
                <Image
                    src={icon}
                    width={32}
                    height={32}
                    alt="Installer Icon"
                />
            )}
            {name}
        </>;

        installer_items.push({
            link: url,
            html: html,
            new_tab: false,
            className: "font-normal"
        });
    });

    // Compile source drop-down items.
    const source_items: Drop_Down_Menu_Type[] = [];

    mod.ModSource?.map((src) => {
        if (!src || !src.source || !src.sourceUrl || !src.query)
            return;
        
        const name = src.source.name;
        const url = "https://" + src.sourceUrl + "/" + src.query;

        let icon = src.source.icon ?? undefined;

        if (cdn && icon)
            icon = cdn + icon;

        const html = <>
            {icon && (
                <Image
                    src={icon}
                    width={32}
                    height={32}
                    alt="Source Icon"
                />
            )}

            {name}
        </>;

        source_items.push({
            link: url,
            html: html,
            new_tab: true,
            className: "font-normal"
        });
    });

    return (
        <div
            key={mod.id}
            className={`${className ?`${className} ` : ``}group rounded bg-bestmods-2/80 flex flex-col shadow-lg ring-4 ring-bestmods-3/80 hover:ring-bestmods-4/80 duration-300`}
        >
            <div className="relative w-full h-64 max-h-64">
                <Image
                    src={banner}
                    width={720}
                    height={360}
                    alt="Mod Banner"
                    className="w-full h-full rounded-t brightness-[75%] group-hover:brightness-100 group-hover:duration-500"
                />
                {mod.ownerName && mod.ownerName.length > 0 && (
                    <div className="absolute bottom-0 left-0 h-8 pr-4 rounded-tr bg-slate-700/80 hover:bg-black/80 hover:font-bold flex items-center text-white text-sm">
                        <p className="ml-1">By {mod.ownerName}</p>
                    </div>
                )}
            </div>
            <div className="p-2 grow text-ellipsis overflow-clip w-full">
                <h3 className="text-center"><a href={viewLink}>{mod.name}</a></h3>
                <p className="text-sm">{descShort}</p>
            </div>
            {catPar && catParLink && (
                <Link
                    href={catParLink}
                    className="p-2"
                >
                    <IconAndText
                        icon={catParIcon}
                        text={<>{catPar.name}</>}
                        alt="Parent Category Icon"
                        imgClassName="w-8 h-8 rounded"
                    />
                </Link>
            )}
            {cat && catLink && (
                <Link
                    href={catLink}
                    className="p-2"
                >
                    <IconAndText
                        icon={catIcon}
                        text={<>{cat.name}</>}
                        alt="Category Icon"
                        imgClassName="w-8 h-8 rounded"
                    />
                </Link>
            )}
            <div className="p-2 flex justify-between items-center">
                <IconAndText
                    icon={<EyeIcon className="w-4 h-4 stroke-white" />}
                    text={<span className="text-sm">{mod.totalViews.toString()}</span>}
                />

                <Rating
                    mod={mod}
                    rating={mod.rating}
                />

                <IconAndText
                    icon={<DownloadIcon className="w-4 h-4" />}
                    text={<span className="text-sm">{mod.totalDownloads.toString()}</span>}
                />
            </div>
            <div className="flex justify-between items-center text-center bg-bestmods-3/80 rounded-b">
                <Link
                    href={viewLink}
                    className="mod-grid-button"
                >View</Link>
                {installer_items.length > 0 && (
                    <DropDown
                        html={<>Install</>}
                        drop_down_items={installer_items}
                        className="mod-grid-button"
                    />
                )}
                {source_items.length > 0 && (
                    <DropDown
                        html={<>Sources</>}
                        drop_down_items={source_items}
                        className="mod-grid-button"
                    />
                )}
            </div>
        </div>
    )
}