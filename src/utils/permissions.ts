import { type Session } from "next-auth";

export const Has_Perm = (
    session: Session,
    perm: string
): boolean => {
    const permissions = session?.user?.permissions;

    if (!permissions)
        return false;
    
    return permissions.includes(perm);
}