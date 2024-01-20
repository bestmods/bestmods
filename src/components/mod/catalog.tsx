import { type ModRowBrowser } from "~/types/mod";
import ModSlideshow from "./slideshow";

export default function ModCatalog ({
    latestMods = [],
    latestSSR = true,

    viewedMods = [],
    viewedSSR = true,

    downloadedMods = [],
    downloadedSSR = true,

    topMods = [],
    topSSR = true,

    topModsToday = [],
    topTodaySSR = true,

    showRowBottom = true,
    defaultDevice = "md"
} : {
    latestMods?: ModRowBrowser[]
    latestSSR?: boolean

    viewedMods?: ModRowBrowser[]
    viewedSSR?: boolean

    downloadedMods?: ModRowBrowser[]
    downloadedSSR?: boolean

    topMods?: ModRowBrowser[]
    topSSR?: boolean

    topModsToday?: ModRowBrowser[]
    topTodaySSR?: boolean

    showRowBottom?: boolean
    defaultDevice?: string
}) {
    return (
        <div className="flex flex-col gap-4">
            {topModsToday.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3>Top Mods Today</h3>
                    <ModSlideshow
                        mods={topModsToday}
                        ssr={topTodaySSR}
                        showRowBottom={showRowBottom}
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
                        ssr={latestSSR}
                        showRowBottom={showRowBottom}
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
                        ssr={topSSR}
                        showRowBottom={showRowBottom}
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
                        ssr={viewedSSR}
                        showRowBottom={showRowBottom}
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
                        ssr={downloadedSSR}
                        showRowBottom={showRowBottom}
                        autoPlaySpeedMin={3000}
                        autoPlaySpeedMax={10000}
                        defaultDevice={defaultDevice}
                    />
                </div>
            )}
        </div>
    )
}