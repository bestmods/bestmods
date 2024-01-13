import { type Source } from "@prisma/client";
import SourceRowTable from "./row/table";
import { type SourceWithModCount } from "~/types/source";

export default function SourceRow ({
    source,
    view = "table",
    showActions = false,
    className
} : {
    source: Source | SourceWithModCount
    view?: string
    showActions?: boolean
    className?: string
}) {
    return (
        <>
            {view == "table" && (
                <SourceRowTable
                    source={source}
                    showActions={showActions}
                    className={className}
                />
            )}
        </>
    )
}