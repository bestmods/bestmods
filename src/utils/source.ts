import { type Source } from "@prisma/client";
import { type SourceWithModCount } from "~/types/source";

export function GetSourceBanner(source?: Source | SourceWithModCount, cdn = "") {
    const banner = source?.banner;

    if (!banner)
        return "/images/default_source_banner.png";

    if (banner.startsWith("https://"))
        return banner;

    return cdn + banner;
}

export function GetSourceIcon(source?: Source | SourceWithModCount, cdn = "") {
    const icon = source?.icon;

    if (!icon)
        return "/images/default_icon.png";

    if (icon.startsWith("https://"))
        return icon;

    return cdn + icon;
}
