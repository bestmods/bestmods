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

import ModActions from "@components/mod/modactions";
import ModDebug from "@components/mod/mod_debug";
import { GetModBanner, GetModUrl } from "@utils/mod";
import { GetCategoryIcon, GetCategoryUrl } from "@utils/category";
import { LimitText } from "@utils/text";
import { GetSourceIcon } from "@utils/source";

export default function ModRowGrid ({
    mod,
    showRelations = true,
    showActions = false,
    showDebug = false,
    showBottom = true
} : {
    mod: ModRowBrowser
    showRelations?: boolean
    showActions?: boolean
    showDebug?: boolean
    showBottom?: boolean
}) {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const viewPort = useContext(ViewPortCtx);

    // General information that we may need to modify.
    const name = LimitText(mod.name, 24);
    const descShort = mod.descriptionShort ? LimitText(mod.descriptionShort, 128) : undefined;
    const ownerName = mod.ownerName ? LimitText(mod.ownerName, 24) : undefined;

    // Generate links.
    const viewLink = GetModUrl(mod);
    const catLink = GetCategoryUrl(mod.category);
    let catParLink: string | undefined = undefined;

    if (mod.category.parent)
        catParLink = GetCategoryUrl(mod.category.parent);

    // Get banner.
    const banner = GetModBanner(mod, cdn);

    // Get category information.
    const catIcon = GetCategoryIcon(mod.category, cdn);

    const catParIcon = GetCategoryIcon(mod?.category?.parent, cdn);

    // Source and installer items.
    const [sourceItems, setSourceItems] = useState<Drop_Down_Menu_Type[]>([]);
    const [installerItems, setInstallerItems] = useState<Drop_Down_Menu_Type[]>([]);

    useEffect(() => {
        if (!viewPort.isMobile && showRelations) {
            const newItems: Drop_Down_Menu_Type[] = [];

            mod.ModSource?.map((src) => {
                const name = src.source.name;

                // Get query URL and check if we need to add a forward slash.
                let query = src.query.trim();

                if (!query.startsWith("/"))
                    query = `/${query}`;

                const url = `https://${src.sourceUrl}${query}`;

                const icon = GetSourceIcon(src.source, cdn);

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
                    new_tab: true
                });
            });

            setSourceItems(newItems);
        } else if (sourceItems.length > 0)
            setSourceItems([]);
    }, [viewPort, showRelations, mod.ModSource, cdn, sourceItems.length])

    useEffect(() => {
        if (!viewPort.isMobile && showRelations) {
            const newItems: Drop_Down_Menu_Type[] = [];

            mod.ModInstaller?.map((ins) => {
                const name = ins.source.name;
                const url = ins.url;

                const icon = GetSourceIcon(ins.source, cdn);

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
    }, [viewPort, showRelations, mod.ModInstaller, cdn, installerItems.length])

    // NSFW.
    const [isNsfw, setIsNsfw] = useState(mod.nsfw);

    return (
        <div className={`group rounded bg-bestmods-2/80 flex flex-col shadow-lg shadow-black ring-4 ring-bestmods-3/80 hover:ring-bestmods-4/80 duration-300 h-full`}>
            <div className="relative w-full h-64 max-h-64">
                <Link href={viewLink}>
                    <Image
                        src={banner}
                        width={720}
                        height={360}
                        alt="Mod Banner"
                        className={`w-full h-full rounded-t brightness-[75%] group-hover:brightness-100 group-hover:duration-500 object-cover object-center${isNsfw ? " filter blur-lg" : ""}`}
                    />
                </Link>
                {ownerName && ownerName.length > 0 && (
                    <div className="absolute bottom-0 left-0 h-8 pr-4 rounded-tr bg-bestmods-1/40 hover:bg-bestmods-1/80 hover:font-bold flex items-center text-white text-sm duration-200">
                        <p className="ml-1">By {ownerName}</p>
                    </div>
                )}
                {mod.nsfw && (
                    <div className="absolute top-0 right-0 h-8 p-4 rounded-bl bg-orange-800/60 hover:bg-orange-800 hover:font-bold flex items-center text-white text-sm duration-200">
                        <span>NSFW</span>
                    </div>
                )}
                {isNsfw && (
                    <div className="absolute left-1/2 top-1/2">
                        <button
                            type="button"
                            className="btn btn-warning"
                            onClick={() => setIsNsfw(false)}
                        >View</button>
                    </div>
                )}
            </div>
            <div className="p-2 grow text-ellipsis overflow-clip w-full">
                <h4 className="text-center">
                    <Link
                        href={viewLink}
                        className="hover:text-inherit"
                    >{name}</Link>
                </h4>
                {descShort && (
                    <p className="text-sm">{descShort}</p>
                )}
            </div>
            {(mod.category.parent && catParLink) && (
                <Link
                    href={catParLink}
                    className="p-2 hover:text-inherit"
                >
                    <IconAndText
                        icon={catParIcon}
                        text={<>{mod.category.parent.name}</>}
                        alt="Parent Category Icon"
                        imgClassName="w-8 h-8 rounded"
                    />
                </Link>
            )}
            <Link
                href={catLink}
                className="p-2 hover:text-inherit"
            >
                <IconAndText
                    icon={catIcon}
                    text={<>{mod.category.name}</>}
                    alt="Category Icon"
                    imgClassName="w-8 h-8 rounded"
                />
            </Link>
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
            {showActions && (
                <ModActions mod={mod} />
            )}
            {showDebug && (
                <ModDebug mod={mod} />
            )}
            {showBottom && (
                <div className={`flex ${(sourceItems.length < 1 && installerItems.length < 1) ? "justify-center" : "justify-between"}  items-center text-center bg-bestmods-3/80 rounded-b`}>
                    <div className="w-1/3">
                        <Link
                            href={viewLink}
                            className="btn btn-mod-grid"
                        >View</Link>
                    </div>
                    {installerItems.length > 0 && (
                        <DropDown
                            html={<>Install</>}
                            drop_down_items={installerItems}
                            className="w-1/3"
                            btnClassName="btn btn-mod-grid"
                        />
                    )}
                    {sourceItems.length > 0 && (
                        <DropDown
                            html={<>Sources</>}
                            drop_down_items={sourceItems}
                            className="w-1/3"
                            btnClassName="btn btn-mod-grid"
                        />
                    )}
                </div>
            )}
        </div>
    )
}