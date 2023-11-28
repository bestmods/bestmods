import { type ReactNode } from "react"
import { type ModViewItem } from "~/types/mod"

export default function ModTabs ({
    children,
    mod,
    view = "overview"
} : {
    children: ReactNode
    mod: ModViewItem
    view?: string
}) {
    // Links.
    const baseUrl = `/view/${mod.url}`;
    
    const installLink = `${baseUrl}/install`;
    const sourcesLink = `${baseUrl}/sources`;
    const downloadsLink = `${baseUrl}/downloads`;
    const creditsLink = `${baseUrl}/credits`;

    return (
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <div className="flex flex-col gap-2">
                <a href={baseUrl} className={`mod-tab-item${view == "overview" ? ` mod-tab-item-active` : ``}`}>Overview</a>
                {mod.install && (
                    <a href={installLink} className={`mod-tab-item${view == "install" ? ` mod-tab-item-active` : ``}`}>Installation</a>
                )}
                {mod.ModSource.length > 0 && (
                    <a href={sourcesLink} className={`mod-tab-item${view == "sources" ? ` mod-tab-item-active` : ``}`}>Sources</a>
                )}
                {mod.ModDownload.length > 0 && (
                    <a href={downloadsLink} className={`mod-tab-item${view == "downloads" ? ` mod-tab-item-active` : ``}`}>Downloads</a>
                )}
                {mod?.ModCredit?.length > 0 && (
                    <a href={creditsLink} className={`mod-tab-item${view == "credits" ? ` mod-tab-item-active` : ``}`}>Credits</a>
                )}
            </div>
            <div className="grow">
                {children}
            </div>
        </div>
    )
}