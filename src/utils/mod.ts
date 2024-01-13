import { type ModWithCategory, type ModRowBrowser, type ModViewItem } from "~/types/mod";

export function GetModUrl(mod: ModViewItem | ModRowBrowser | ModWithCategory ) {
    const catUrl = mod.category?.parent?.url ?? mod.category?.url ?? "global";

    return `/${catUrl}/mod/${mod.url}`;
}