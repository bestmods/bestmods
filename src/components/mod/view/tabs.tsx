import { ReactNode } from "react"
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
    const overviewLink = "/view/" + mod.url;
    const installLink = "/view/" + mod.url + "/install";
    const sourcesLink = "/view/" + mod.url + "/sources";
    const downloadsLink = "/view/" + mod.url + "/downloads";
    const credits_link = "/view/" + mod.url + "/credits";

    return (
        <div className="mod-tab">
            <div className="mod-tab-items">
                <a href={overviewLink} className={`mod-button-item ${view == "overview" ? ` mod-button-item-active` : ``}`}>Overview</a>
                {mod.install && (
                    <a href={installLink} className={`mod-button-item ${view == "install" ? ` mod-button-item-active` : ``}`}>Installation</a>
                )}
                {mod.ModSource.length > 0 && (
                    <a href={sourcesLink} className={`mod-button-item${view == "sources" ? ` mod-button-item-active` : ``}`}>Sources</a>
                )}
                {mod.ModDownload.length > 0 && (
                    <a href={downloadsLink} className={`mod-button-item${view == "downloads" ? ` mod-button-item-active` : ``}`}>Downloads</a>
                )}
                {mod?.ModCredit?.length > 0 && (
                    <a href={credits_link} className={`mod-button-item${view == "credits" ? ` mod-button-item-active` : ``}`}>Credits</a>
                )}
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}