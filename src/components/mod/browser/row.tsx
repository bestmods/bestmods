import { type ModRowBrowser } from "~/types/mod";
import ModRowGrid from "./row/grid";
import ModRowTable from "./row/table";

export default function ModRow ({
    mod,
    display = "grid",
    showRelations = true,
    showActions = false,
    showDebug = false
} : {
    mod: ModRowBrowser
    display?: string
    showRelations?: boolean
    showActions?: boolean
    showDebug?: boolean
}) {
    return (
        <>
            {display == "grid" ? (
                <ModRowGrid
                    mod={mod}
                    showRelations={showRelations}
                    showActions={showActions}
                    showDebug={showDebug}
                />
            ) : (
                <ModRowTable mod={mod} />
            )}
        </>
    )
}