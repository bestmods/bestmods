import { type ModViewItem } from "~/types/mod";

export function GetModDescription ({
    mod
} : {
    mod?: ModViewItem
}): string | undefined {
    let desc: string | undefined = mod?.descriptionShort ?? undefined;

    if (mod?.category?.description)
        desc = `${desc ?? ""} ${mod.category.description}`;

    return desc;
}