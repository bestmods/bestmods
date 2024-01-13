import { type ModRowBrowser } from "~/types/mod";
import ModRowGrid from "./row/grid";
import ModRowTable from "./row/table";
import { LimitText } from "@utils/text";
import { GetModUrl } from "@utils/mod";
import { GetCategoryUrl } from "@utils/category";

export default function ModRow ({
    mod,
    display = "grid",
    showRelations = true,
    showActions = false,
    showDebug = false
} : {
    mod: ModRowBrowser
    display?: string
    showRelations?: boolean
    showActions?: boolean
    showDebug?: boolean
}) {
    const cdn = (process.env.NEXT_PUBLIC_CDN_URL) ? process.env.NEXT_PUBLIC_CDN_URL : "";

    // Generate correct banner.   
    let banner = cdn + "/images/default_mod_banner.png";

    if (mod.banner && mod.banner.length > 0)
        banner = cdn + mod.banner;

    // Categories.
    const cat = mod.category;
    const cat_par = cat?.parent;

    // Generate category info.
    const defaultCatIcon = cdn + "/images/default_icon.png";
    const catIcon = (cat && cat.icon) ? cdn + cat.icon : defaultCatIcon;
    const catParIcon = (cat_par && cat_par.icon) ? cdn + cat_par.icon : defaultCatIcon;

    // Generate links.
    const viewLink = GetModUrl(mod);

    const catParLink = cat_par ? GetCategoryUrl(cat_par) : "global";
    const catLink = cat ? GetCategoryUrl(cat) : "global";

    // Handle text limitations
    const name = LimitText(mod.name, 24);
    const descShort = mod.descriptionShort ? LimitText(mod.descriptionShort, 128) : undefined;
    const ownerName = mod.ownerName ? LimitText(mod.ownerName, 24) : undefined;

    return (
        <>
            {display == "grid" ? (
                <ModRowGrid
                    mod={mod}
                    showRelations={showRelations}
                    banner={banner}
                    name={name}
                    descShort={descShort}
                    ownerName={ownerName}
                    sources={mod.ModSource}
                    installers={mod.ModInstaller}
                    cat={cat}
                    catIcon={catIcon}
                    catLink={catLink}
                    catPar={cat_par}
                    catParIcon={catParIcon}
                    catParLink={catParLink}
                    viewLink={viewLink}
                    showActions={showActions}
                    showDebug={showDebug}
                />
            ) : (
                <ModRowTable
                    mod={mod}
                    banner={banner}
                    name={name}
                    descShort={descShort}
                    ownerName={ownerName}
                    sources={mod.ModSource}
                    installers={mod.ModInstaller}
                    cat={cat}
                    catIcon={catIcon}
                    catLink={catLink}
                    catPar={cat_par}
                    catParIcon={catParIcon}
                    catParLink={catParLink}
                    viewLink={viewLink}
                />
            )}
        </>
    )
}