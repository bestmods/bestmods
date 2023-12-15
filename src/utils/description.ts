import { type ModViewItem } from "~/types/mod";

export function GetModDescription ({
    mod
} : {
    mod?: ModViewItem
}): string | undefined {
    let desc: string | undefined = mod?.description;

    if (mod?.category?.description)
        desc = ` ${mod.category.description}`;

    return desc;
}