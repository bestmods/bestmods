import { type Category } from "@prisma/client";
import ModRatingRender from "../mod/rating/render";
import DropDown, { type Drop_Down_Menu_Type } from "../utils/drop_down";
import Link from "next/link";

import EyeIcon from "../utils/icons/eye";
import DownloadIcon from "../utils/icons/download";

const GridRow: React.FC<{
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
        <div key={mod.id} className={"modbrowser-grid-row " + addClasses}>
            <div className="modbrowser-grid-image">
                <img src={banner} alt="Mod Banner" />
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
                <div className="modbrowser-grid-category">
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
            <div className="modbrowser-grid-stats">
                <div className="modbrowser-grid-stats-views">
                    <EyeIcon
                        classes={["w-4", "h-4"]}
                    />
                    <span className="text-white text-sm">{mod.totalViews.toString()}</span>
                </div>

                <ModRatingRender
                    mod={mod}
                />

                <div className="modbrowser-grid-stats-downloads">
                    <DownloadIcon
                        classes={["w-4", "h-4"]}
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
                    />
                )}
                {source_items.length > 0 && (
                    <DropDown
                        html={<>Sources</>}
                        drop_down_items={source_items}
                    />
                )}
            </div>
        </div>
    );
}

export default GridRow;