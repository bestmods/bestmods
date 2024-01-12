import { type User } from "@prisma/client";
import UserRowTable from "./row/table";

export default function UserRow ({
    user,
    view = "table",
    showActions = true
} : {
    user: User,
    view?: string
    showActions?: boolean
}) {
    return (
        <>
            {view == "table" && (
                <UserRowTable
                    user={user}
                    showActions={showActions}
                />
            )}
        </>
    )
}