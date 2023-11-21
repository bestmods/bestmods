import { type ModRowBrowser } from "~/types/mod";
import ModRowGrid from "./row/grid";
import ModRowTable from "./row/table";

export default function ModRow ({
    mod,
    display = "grid"
} : {
    mod: ModRowBrowser,
    display?: string
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
    const viewLink = "/view/" + mod.url;

    const catParLink = (cat_par) ? "/category/" + cat_par.url : null;
    const catLink = ((cat) ? "/category" + ((cat_par) ? "/" + cat_par.url : "") + "/" + cat.url : null);

    // Generate classes.
    const addClasses = (cat && cat.classes) ? " " + cat.classes : "";

    // Handle short description.
    const descShort = String(mod.descriptionShort);

    return (
        <>
            {display == "grid" ? (
                <ModRowGrid
                    mod={mod}
                    addClasses={addClasses}
                    banner={banner}
                    descShort={descShort}
                    cat={cat}
                    catIcon={catIcon}
                    catLink={catLink}
                    catPar={cat_par}
                    catParIcon={catParIcon}
                    catParLink={catParLink}
                    viewLink={viewLink}
                />
            ) : (
                <ModRowTable
                    mod={mod}
                    addClasses={addClasses}
                    banner={banner}
                    descShort={descShort}
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