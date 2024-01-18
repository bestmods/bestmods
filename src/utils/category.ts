import { type Category } from "@prisma/client";
import { type CategoryWithParentAndCount, type CategoryWithChildrenAndCounts, type CategoryWithCount, type CategoryWithParent } from "~/types/category";

export function GetCategoryUrl(category: CategoryWithParent | CategoryWithCount | CategoryWithChildrenAndCounts | Category) {
    let url = "/";

    if ("parent" in category) {
        if (category.parent?.url)
            url += `${category.parent.url}/`;
    }

    url += category.url;

    return url;
}

export function GetCategoryMetaTitle(category?: Category | CategoryWithChildrenAndCounts | CategoryWithCount | CategoryWithParent | CategoryWithParentAndCount) {
    if (!category)
        return "Not Found - Best Mods";

    const name = category.name;
    let parName: string | undefined = undefined;

    if ("parent" in category && category.parent)
        parName = category.parent.name;

    return `${name} - ${parName ? `${parName} - ` : ``}Best Mods`
}

export function GetCategoryMetaDesc(category?: Category | CategoryWithChildrenAndCounts | CategoryWithCount | CategoryWithParent | CategoryWithParentAndCount, totMods = 0) {
    if (!category)
        return undefined;

    const name = category.name;
    const desc = category.description;
    let parName: string | undefined = undefined;

    if ("parent" in category && category.parent)
        parName = category.parent.name;
    
    return `Find the best mods for${parName ? ` ${parName}` : ``} ${name}! Tracking ${totMods.toString()} mods and counting!${desc ? ` ${desc}` : ``}`;
}

export function GetCategoryBanner(category?: Category | CategoryWithChildrenAndCounts | CategoryWithCount | CategoryWithParent | CategoryWithParentAndCount | null, cdn = "") {
    const banner = category?.banner;

    if (!banner)
        return "/images/default_category.png";

    if (banner.startsWith("https://"))
        return banner;

    return cdn + banner;
}

export function GetCategoryIcon(category?: Category | CategoryWithChildrenAndCounts | CategoryWithCount | CategoryWithParent | CategoryWithParentAndCount | null, cdn = "") {
    const icon = category?.icon;

    if (!icon)
        return "/images/default_icon.png";

    if (icon.startsWith("https://"))
        return icon;

    return cdn + icon;
}

export function GetCategoryBgImage(category?: Category | CategoryWithChildrenAndCounts | CategoryWithCount | CategoryWithParent | CategoryWithParentAndCount): string | undefined {
    let bgPath: string | undefined = undefined;

    if (!category)
        return bgPath;

    if (!("parent" in category))
        return bgPath;

    let bgFile: string | undefined = undefined;

    if (category.hasBg && category.parent)
        bgFile = `${category.parent.url}_${category.url}.png`;
    else if (category.hasBg && category.parent == null)
        bgFile = `${category.url}.png`;
    else if (category.parent && category.parent.hasBg)
        bgFile = `${category.parent.url}.png`; 

    if (bgFile)
        bgPath = `/images/backgrounds/${bgFile}`;

    return bgPath;
}