import { type Session } from "next-auth";

export const Has_Perm = (
    session: Session | null,
    perm: string
): boolean => {
    if (!session)
        return false;
    
    const permissions = session?.user?.permissions;

    if (!permissions)
        return false;
    
    return permissions.includes(perm);
}