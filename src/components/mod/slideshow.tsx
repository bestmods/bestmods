import { ModRowBrowser } from "~/types/mod";
import ModRow from "./browser/row";

export default function ModSlideshow ({
    mods
} : {
    mods: ModRowBrowser[]
}) {
    return (
        <div
            className="grid gap-x-4 gap-y-6 py-6"
            style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(320px, 1fr))`
            }}
        >
            {mods.map((mod, index) => {
                return (
                    <ModRow
                        key={`mod-${index.toString()}`}
                        mod={mod}
                    />
                )
            })}
        </div>
    )
}