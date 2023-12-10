import { type Category } from "@prisma/client";

import Rating from "@components/mod/rating";

import DropDown, { type Drop_Down_Menu_Type } from "@components/drop_down";
import Link from "next/link";

import EyeIcon from "@components/icons/eye";
import DownloadIcon from "@components/icons/download";
import { type ModRowBrowser } from "~/types/mod";
import Image from "next/image";
import IconAndText from "@components/icon_and_text";
import React, { useContext, useEffect, useState } from "react";
import { ViewPortCtx } from "@components/main";

export default function ModRowGrid ({
    mod,
    showRelations = true,
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
    mod: ModRowBrowser
    showRelations?: boolean
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
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    const viewPort = useContext(ViewPortCtx);

    const [sourceItems, setSourceItems] = useState<Drop_Down_Menu_Type[]>([]);
    const [installerItems, setInstallerItems] = useState<Drop_Down_Menu_Type[]>([]);

    useEffect(() => {
        if (!viewPort.isMobile && showRelations) {
            const newItems: Drop_Down_Menu_Type[] = [];

            mod.ModSource?.map((src) => {
                const name = src.source.name;
                const url = `https://${src.sourceUrl}/${src.query}`;

                let icon = "/images/default_icon.png";


                if (src.source.icon)
                    icon = cdn + src.source.icon;

                newItems.push({
                    link: url,
                    html:
                        <IconAndText
                            icon={icon}
                            width={20}
                            height={20}
                            text={<span>{name}</span>}
                        />,
                    className: "font-normal hover:text-white",
                    new_tab: false
                });
            });

            setSourceItems(newItems);
        } else if (sourceItems.length > 0)
            setSourceItems([]);
    }, [viewPort, mod.ModSource, cdn, sourceItems.length])

    useEffect(() => {
        if (!viewPort.isMobile && showRelations) {
            const newItems: Drop_Down_Menu_Type[] = [];

            mod.ModInstaller?.map((ins) => {
                const name = ins.source.name;
                const url = ins.url;

                let icon = "/images/default_icon.png";

                if (ins.source.icon)
                    icon = cdn + ins.source.icon;

                newItems.push({
                    link: url,
                    html:
                        <IconAndText
                            icon={icon}
                            width={20}
                            height={20}
                            text={<span>{name}</span>}
                        />,
                    className: "font-normal",
                    new_tab: false
                })
            })

            setInstallerItems(newItems);
        } else if (installerItems.length > 0)
            setInstallerItems([]);
    }, [viewPort, mod.ModInstaller, cdn, installerItems.length])

    return (
        <div
            key={mod.id}
            className={`${className ?`${className} ` : ``}group rounded bg-bestmods-2/80 flex flex-col shadow-lg shadow-black ring-4 ring-bestmods-3/80 hover:ring-bestmods-4/80 duration-300 h-full`}
        >
            <div className="relative w-full h-64 max-h-64">
                <Link href={viewLink}>
                    <Image
                        src={banner}
                        width={720}
                        height={360}
                        alt="Mod Banner"
                        className="w-full h-full rounded-t brightness-[75%] group-hover:brightness-100 group-hover:duration-500 object-cover object-center"
                    />
                </Link>
                {mod.ownerName && mod.ownerName.length > 0 && (
                    <div className="absolute bottom-0 left-0 h-8 pr-4 rounded-tr bg-bestmods-1/40 hover:bg-bestmods-1/80 hover:font-bold flex items-center text-white text-sm duration-200">
                        <p className="ml-1">By {mod.ownerName}</p>
                    </div>
                )}
            </div>
            <div className="p-2 grow text-ellipsis overflow-clip w-full">
                <h3 className="text-center">
                    <Link
                        href={viewLink}
                        className="hover:text-inherit"
                    >{mod.name}</Link>
                </h3>
                <p className="text-sm">{descShort}</p>
            </div>
            {catPar && catParLink && (
                <Link
                    href={catParLink}
                    className="p-2 hover:text-inherit"
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
                    className="p-2 hover:text-inherit"
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
            <div className={`flex ${(sourceItems.length < 1 && installerItems.length < 1) ? "justify-center" : "justify-between"}  items-center text-center bg-bestmods-3/80 rounded-b`}>
                <div className="mod-grid-button">
                    <Link
                        href={viewLink}
                        className="w-full hover:text-inherit"
                    >View</Link>
                </div>
                {installerItems.length > 0 && (
                    <div className="mod-grid-button">
                        <DropDown
                            html={<>Install</>}
                            drop_down_items={installerItems}
                        />
                    </div>
                )}
                {sourceItems.length > 0 && (
                    <div className="mod-grid-button">
                        <DropDown
                            html={<>Sources</>}
                            drop_down_items={sourceItems}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}