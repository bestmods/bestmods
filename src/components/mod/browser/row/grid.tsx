import { type Category } from "@prisma/client";

import ModRatingRender from "@components/mod/rating/render";

import DropDown, { type Drop_Down_Menu_Type } from "@components/drop_down";
import Link from "next/link";

import EyeIcon from "@components/icons/eye";
import DownloadIcon from "@components/icons/download";
import { type ModRowBrowser } from "~/types/mod";
import Image from "next/image";

export default function ModRowGrid ({
    mod,
    addClasses,
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
    addClasses: string,
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
            new_tab: false
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
            new_tab: true
        });
    });

    return (
        <div key={mod.id} className={"modbrowser-grid-row " + addClasses}>
            <div className="modbrowser-grid-image">
                <Image
                    src={banner}
                    width={720}
                    height={360}
                    alt="Mod Banner"
                />
                {mod.ownerName && mod.ownerName.length > 0 && (
                    <div className="modbrowser-grid-image-owner">
                        <p>By {mod.ownerName}</p>
                    </div>
                )}
            </div>
            <div className="modbrowser-grid-main">
                <h3><a href={viewLink}>{mod.name}</a></h3>
                <p>{descShort}</p>
            </div>
            <div className="grow"></div>
            {catPar && (
                <div className="modbrowser-grid-category">
                    <Image
                        src={catParIcon}
                        width={32}
                        height={32}
                        alt="Category Icon"
                    />
                    <span>
                        {catParLink ? (
                            <a href={catParLink}>{catPar.name}</a>
                        ) : (
                            <span>{catPar.name}</span>
                        )}
                    </span>
                </div>
            )}
            {cat && (
                <div className="modbrowser-grid-category">
                    <Image
                        src={catIcon}
                        width={32}
                        height={32}
                        alt="Category Icon"
                    />
                    <span>
                        {catLink ? (
                            <a href={catLink}>{cat.name}</a>
                        ) : (
                            <span>{cat.name}</span>
                        )}
                    </span>
                </div>
            )}
            <div className="modbrowser-grid-stats">
                <div className="modbrowser-grid-stats-views">
                    <EyeIcon
                        className={"w-4 h-4"}
                    />
                    <span className="text-white text-sm">{mod.totalViews.toString()}</span>
                </div>

                <ModRatingRender
                    mod={mod}
                    rating={mod.rating}
                />

                <div className="modbrowser-grid-stats-downloads">
                    <DownloadIcon
                        className={"w-4 h-4"}
                    />
                    <span>{mod.totalDownloads.toString()}</span>
                </div>
            </div>
            <div className="modbrowser-grid-links">
                <Link href={viewLink}>View</Link>
                {installer_items.length > 0 && (
                    <DropDown
                        html={<>Install</>}
                        drop_down_items={installer_items}
                        className={"w-1/3"}
                    />
                )}
                {source_items.length > 0 && (
                    <DropDown
                        html={<>Sources</>}
                        drop_down_items={source_items}
                        className={"w-1/3"}
                    />
                )}
            </div>
        </div>
    )
}