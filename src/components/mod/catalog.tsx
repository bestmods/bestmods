import { type ModRowBrowser } from "~/types/mod";
import ModSlideshow from "./slideshow";

export default function ModCatalog ({
    latestMods = [],
    viewedMods = [],
    downloadedMods = [],
    topMods = [],
    topModsToday = [],
    defaultDevice = "md"
} : {
    latestMods?: ModRowBrowser[]
    viewedMods?: ModRowBrowser[],
    downloadedMods?: ModRowBrowser[]
    topMods?: ModRowBrowser[]
    topModsToday?: ModRowBrowser[]
    defaultDevice?: string
}) {
    return (
        <div className="flex flex-col gap-4">
            {topModsToday.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3>Top Mods Today</h3>
                    <ModSlideshow
                        mods={topModsToday}
                        autoPlaySpeedMin={3000}
                        autoPlaySpeedMax={10000}
                        defaultDevice={defaultDevice}
                    />
                </div>
            )}
            {latestMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3>Latest Mods</h3>
                    <ModSlideshow
                        mods={latestMods}
                        autoPlaySpeedMin={3000}
                        autoPlaySpeedMax={10000}
                        defaultDevice={defaultDevice}
                    />
                </div>
            )}
            {topMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3>Top Mods All-Time</h3>
                    <ModSlideshow
                        mods={topMods}
                        autoPlaySpeedMin={3000}
                        autoPlaySpeedMax={10000}
                        defaultDevice={defaultDevice}
                    />
                </div>
            )}
            {viewedMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3>Most Viewed Mods</h3>
                    <ModSlideshow
                        mods={viewedMods}
                        autoPlaySpeedMin={3000}
                        autoPlaySpeedMax={10000}
                        defaultDevice={defaultDevice}
                    />
                </div>
            )}
            {downloadedMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3>Most Downloaded Mods</h3>
                    <ModSlideshow
                        mods={downloadedMods}
                        autoPlaySpeedMin={3000}
                        autoPlaySpeedMax={10000}
                        defaultDevice={defaultDevice}
                    />
                </div>
            )}
        </div>
    )
}