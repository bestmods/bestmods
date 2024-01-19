import { type ModViewItem } from "~/types/mod";
import { LimitText } from "./text";

export function GetModMetaDescription ({
    mod
} : {
    mod?: ModViewItem
}): string | undefined {
    let desc = mod?.descriptionShort;
    const catDesc = mod?.category?.description;

    if (!desc && catDesc)
        desc = catDesc;

    if (!desc)
        return undefined;

    desc = LimitText(desc, 120);

    return desc;
}