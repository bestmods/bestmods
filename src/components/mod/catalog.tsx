import { ModRowBrowser } from "~/types/mod";
import ModRow from "./browser/row";

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
                    <div className="mod-slideshow">
                        {latestMods.map((mod, index) => {
                            return (
                                <ModRow
                                    key={`mod-${index.toString()}`}
                                    mod={mod}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
            {viewedMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Most Viewed Mods</h2>
                    <div className="mod-slideshow">
                        {viewedMods.map((mod, index) => {
                            return (
                                <ModRow
                                    key={`mod-${index.toString()}`}
                                    mod={mod}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
            {downloadedMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Most Downloaded Mods</h2>
                    <div className="mod-slideshow">
                        {downloadedMods.map((mod, index) => {
                            return (
                                <ModRow
                                    key={`mod-${index.toString()}`}
                                    mod={mod}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}