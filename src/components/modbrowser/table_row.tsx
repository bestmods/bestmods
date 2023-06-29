import { type Category } from "@prisma/client";
import { ModRatingRender } from "../mod_browser";
import DropDown, { Drop_Down_Menu_Type } from "../utils/drop_down";
import Link from "next/link";

import EyeIcon from "../utils/icons/eye";
import DownloadIcon from "../utils/icons/download";

const TableRow: React.FC<{
    mod: any,
    addClasses: string,
    banner: string,
    descShort: string,
    cat: any,
    catPar?: Category | null,
    catParIcon: string,
    catParLink: string | null,
    catIcon: string,
    catLink: string | null,
    viewLink: string
}> = ({
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
}) => {
    const cdn: string | undefined = process.env.NEXT_PUBLIC_URL;

    // Compile installer drop-down items.
    const installer_items: Drop_Down_Menu_Type[] = [];

    if (mod.ModInstaller && mod.ModInstaller.length > 0) {
        mod.ModInstaller.map((ins: any) => {
            const name = ins.source.name;
            const url = ins.url;

            let icon = ins.source.icon ?? undefined;

            if (cdn && icon)
                icon = cdn + icon;

            const html = <>
                {icon && (
                    <img src={icon} />
                )}

                {name}
            </>;

            installer_items.push({
                link: url,
                html: html,
                new_tab: false
            });
        });
    }

    // Compile source drop-down items.
    const source_items: Drop_Down_Menu_Type[] = [];

    if (mod.ModSource && mod.ModSource.length > 0) {
        mod.ModSource.map((src: any) => {
            if (!src || !src.source || !src.sourceUrl || !src.query)
                return;
            
            const name = src.source.name;
            const url = "https://" + src.sourceUrl + "/" + src.query;

            let icon = src.source.icon ?? undefined;

            if (cdn && icon)
                icon = cdn + icon;

            const html = <>
                {icon && (
                    <img src={icon} />
                )}

                {name}
            </>;

            source_items.push({
                link: url,
                html: html,
                new_tab: true
            });
        });
    }

    return (
        <tr key={mod.id} className={"modbrowser-table-row" + addClasses}>
            <td className="modbrowser-table-data">
                <div className="modbrowser-table-banner">
                    <img src={banner} alt="Mod Banner" />
                </div>
            </td>
            <td className="modbrowser-table-data">
                <div className="modbrowser-table-general">
                    <h3>{mod.name}</h3>
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
                            <img src={catParIcon} alt="Category Icon" />
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
                            <img src={catIcon} alt="Category Icon" />
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
                    />
                </div>
            </td>
            <td className="modbrowser-table-data">
                <div className="modbrowser-table-btns">
                    <Link href={viewLink}>View</Link>
                    {installer_items.length > 0 && (
                        <DropDown
                            html={<>Install</>}
                            drop_down_items={installer_items}
                        />
                    )}
                    {source_items.length > 0 && (
                        <DropDown
                            html={<>Sources</>}
                            drop_down_items={source_items}
                        />
                    )}
                </div>
            </td>
        </tr>
    );
}

export default TableRow;