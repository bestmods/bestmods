import { ModRowBrowser } from "~/types/mod";
import ModSlideshow from "./slideshow";

export default function ModCatalog ({
    latestMods = [],
    viewedMods = [],
    downloadedMods = []
} : {
    latestMods: ModRowBrowser[]
    viewedMods: ModRowBrowser[],
    downloadedMods: ModRowBrowser[]
}) {
    return (
        <div className="flex flex-col gap-4">
            {latestMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Latest Mods</h2>
                    <ModSlideshow mods={latestMods} />
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