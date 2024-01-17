import { type Session } from "next-auth";
import { type ModWithCategory, type ModRowBrowser, type ModViewItem } from "~/types/mod";
import { type PrismaClient } from "@prisma/client";

export function GetModUrl(mod: ModViewItem | ModRowBrowser | ModWithCategory ) {
    const catUrl = mod.category?.parent?.url ?? mod.category?.url ?? "global";

    return `/${catUrl}/mod/${mod.url}`;
}

export async function InsertUniqueView(prisma: PrismaClient, modId: number, session?: Session) {
    if (!session?.user)
        return;

    // Insert unique mod view if we're signed in.
    await prisma.modUniqueView.upsert({
        where: {
            modId_userId: {
                userId: session.user.id,
                modId: modId
            }
        },
        create: {
            userId: session.user.id,
            modId: modId
        },
        update: {}
    })
}

export async function IncTotalViews(prisma: PrismaClient, modId: number, session?: Session) {
    if (!session?.user)
        return;

    // Increment total views count.
    await prisma.mod.update({
        data: {
            totalViews: {
                increment: 1
            }
        },
        where: {
            id: modId
        }
    })
}