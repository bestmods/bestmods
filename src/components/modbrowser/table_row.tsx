import { type Category } from "@prisma/client";
import { ModRatingRender } from "../mod_browser";
import DropDown, { Drop_Down_Menu_Type } from "../utils/drop_down";
import Link from "next/link";

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
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11085)"><path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 12C3.60014 7.90264 7.33603 5 12 5C16.664 5 20.3999 7.90264 22 12C20.3999 16.0974 16.664 19 12 19C7.33603 19 3.60014 16.0974 2 12Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></g><defs><clipPath id="clip0_429_11085"><rect width="24" height="24" fill="white" /></clipPath></defs></svg>
                        <span>{mod.totalViews.toString()}</span>
                    </div>
                    <div>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11L12 15M12 15L8 11M12 15V3M21 15V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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