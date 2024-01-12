import { type Source } from "@prisma/client";
import SourceRowTable from "./row/table";

export default function SourceRow ({
    source,
    view = "table",
    showActions = false,
    className
} : {
    source: Source
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