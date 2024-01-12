import { type Redirect } from "@prisma/client";
import RedirectTableRow from "./row/table";

export default function RedirectRow ({
    redirect,
    view = "table"
} : {
    redirect: Redirect
    view?: string
}) {
    return (
        <>
            {view == "table" && (
                <RedirectTableRow redirect={redirect} />
            )}
        </>
    )
}