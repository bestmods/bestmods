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

    categories,

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

    categories?: number[]

    showRowBottom?: boolean
    defaultDevice?: string
}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h2>Top Mods Today</h2>
                <ModSlideshow
                    mods={topModsToday}

                    showRowBottom={showRowBottom}
                    autoPlaySpeedMin={3000}
                    autoPlaySpeedMax={10000}
                    defaultDevice={defaultDevice}

                    ssr={topTodaySSR}
                    categories={categories}
                    timeframe={1}
                />
            </div>
            <div className="flex flex-col gap-2">
                <h2>Latest Mods</h2>
                <ModSlideshow
                    mods={latestMods}

                    showRowBottom={showRowBottom}
                    autoPlaySpeedMin={3000}
                    autoPlaySpeedMax={10000}
                    defaultDevice={defaultDevice}

                    ssr={latestSSR}
                    sort={4}
                    categories={categories}
                />
            </div>
            <div className="flex flex-col gap-2">
                <h2>Top Mods All-Time</h2>
                <ModSlideshow
                    mods={topMods}
                    
                    showRowBottom={showRowBottom}
                    autoPlaySpeedMin={3000}
                    autoPlaySpeedMax={10000}
                    defaultDevice={defaultDevice}

                    ssr={topSSR}
                    timeframe={undefined}
                    categories={categories}
                />
            </div>
            <div className="flex flex-col gap-2">
                <h2>Most Viewed Mods</h2>
                <ModSlideshow
                    mods={viewedMods}

                    showRowBottom={showRowBottom}
                    autoPlaySpeedMin={3000}
                    autoPlaySpeedMax={10000}
                    defaultDevice={defaultDevice}

                    ssr={viewedSSR}
                    categories={categories}
                    sort={1}
                />
            </div>
            <div className="flex flex-col gap-2">
                <h2>Most Downloaded Mods</h2>
                <ModSlideshow
                    mods={downloadedMods}
                    showRowBottom={showRowBottom}
                    autoPlaySpeedMin={3000}
                    autoPlaySpeedMax={10000}
                    defaultDevice={defaultDevice}

                    ssr={downloadedSSR}
                    categories={categories}
                    sort={2}
                />
            </div>
        </div>
    )
}