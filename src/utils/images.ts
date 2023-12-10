import { type CategoryWithParent } from "~/types/category";

export function GetBgImage(cat: CategoryWithParent | null | undefined): string | undefined {
    let bgPath: string | undefined = undefined;

    if (cat) {
        let bgFile: string | undefined = undefined;

        if (cat.hasBg && cat.parent)
            bgFile = `${cat.parent.url}_${cat.url}.png`;
        else if (cat.hasBg && cat.parent == null)
            bgFile = `${cat.url}.png`;
        else if (cat.parent && cat.parent.hasBg)
            bgFile = `${cat.parent.url}.png`; 

        if (bgFile)
            bgPath = `/images/backgrounds/${bgFile}`;
    }

    return bgPath;
}