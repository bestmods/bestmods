import Link from "next/link";

import ModRatingRender from "@components/mod/rating/render";

import DropDown, { type Drop_Down_Menu_Type } from "@components/drop_down";

import EyeIcon from "@components/icons/eye";
import DownloadIcon from "@components/icons/download";

import { type Category } from "@prisma/client";
import { type ModRowBrowser } from "~/types/mod";
import Image from "next/image";

export default function ModRowTable ({
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

    mod.ModInstaller.map((ins) => {
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

    mod.ModSource.map((src) => {
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
        <tr key={mod.id} className={"modbrowser-table-row" + addClasses}>
            <td className="modbrowser-table-data">
                <div className="modbrowser-table-banner">
                    <Image
                        src={banner}
                        width={720}
                        height={360}
                        alt="Mod Banner"
                    />
                </div>
            </td>
            <td className="modbrowser-table-data">
                <div className="modbrowser-table-general">
                    <h3><Link href={viewLink}>{mod.name}</Link></h3>
                    <p>{descShort}</p>
                </div>
            </td>
            <td className="modbrowser-table-data">
                <div className="modbrowser-table-owner">
                    {mod.ownerName && mod.ownerName.length > 0 && (
                        <p>By {mod.ownerName}</p>
                    )}
                </div>
            </td>
            <td className="modbrowser-table-data">
                <div className="modbrowser-table-cats">
                    {catPar && (
                        <div>
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
                        <div>
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
                </div>
            </td>

            <td className="modbrowser-table-data">
                <div className="modbrowser-table-stats">
                    <div>
                        <EyeIcon />
                        <span>{mod.totalViews.toString()}</span>
                    </div>
                    <div>
                        <DownloadIcon />
                        <span>{mod.totalDownloads.toString()}</span>
                    </div>
                </div>
            </td>
            <td className="modbrowser-table-data">
                <div className="modbrowser-table-rating">
                    <ModRatingRender
                        mod={mod}
                        rating={mod.rating}
                    />
                </div>
            </td>
            <td className="modbrowser-table-data">
                <div className="modbrowser-table-links">
                    <Link href={viewLink}>View</Link>
                </div>
            </td>
            <td className="modbrowser-table-data">
                <div className="modbrowser-table-links">
                    {installer_items.length > 0 && (
                        <DropDown
                            html={<>Install</>}
                            drop_down_items={installer_items}
                            className={"w-1/3"}
                        />
                    )}
                </div>
            </td>
            <td className="modbrowser-table-data">
                <div className="modbrowser-table-links">
                    {source_items.length > 0 && (
                        <DropDown
                            html={<>Sources</>}
                            drop_down_items={source_items}
                            className={"w-1/3"}
                        />
                    )}
                </div>
            </td>
        </tr>
    )
}