import { type Permissions, type PrismaClient } from "@prisma/client";

export const Has_Perm = async (
    prisma: PrismaClient,
    id: string,
    perm: string
): Promise<[boolean, string | any | null]> => {
    let perm_check: Permissions | null = null;

    try {
        perm_check = await prisma.permissions.findFirst({
            where: {
                userId: id,
                perm: perm
            }
        });
    } catch (error) {
        return [false, error];
    }

    if (!perm_check)
        return [false, null];

    return [true, null];
}