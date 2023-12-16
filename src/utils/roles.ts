import { type UserRole } from "@prisma/client";
import { type Session } from "next-auth";

export function HasRole (
    session: Session | null,
    role: UserRole
): boolean {
    if (!session)
        return false;

    const roles = session.user?.roles;

    if (!roles)
        return false;
    
    return roles.includes(role);
}