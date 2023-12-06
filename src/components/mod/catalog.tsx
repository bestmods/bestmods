import { ModRowBrowser } from "~/types/mod";
import ModSlideshow from "./slideshow";

export default function ModCatalog ({
    latestMods = [],
    viewedMods = [],
    downloadedMods = [],
    topMods = [],
    topModsToday = []
} : {
    latestMods?: ModRowBrowser[]
    viewedMods?: ModRowBrowser[],
    downloadedMods?: ModRowBrowser[]
    topMods?: ModRowBrowser[]
    topModsToday?: ModRowBrowser[]
}) {
    return (
        <div className="flex flex-col gap-4">
            {topModsToday.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Top Mods Today</h2>
                    <ModSlideshow mods={topModsToday} />
                </div>
            )}
            {latestMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Latest Mods</h2>
                    <ModSlideshow mods={latestMods} />
                </div>
            )}
            {topMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Top Mods All-Time</h2>
                    <ModSlideshow mods={topMods} />
                </div>
            )}
            {viewedMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Most Viewed Mods</h2>
                    <ModSlideshow mods={viewedMods} />
                </div>
            )}
            {downloadedMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Most Downloaded Mods</h2>
                    <ModSlideshow mods={downloadedMods} />
                </div>
            )}
        </div>
    )
}