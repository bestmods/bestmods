import { type Session } from "next-auth";
import { type ModWithCategory, type ModRowBrowser, type ModViewItem } from "~/types/mod";
import { type PrismaClient } from "@prisma/client";

export function GetModUrl(mod: ModViewItem | ModRowBrowser | ModWithCategory ) {
    const catUrl = mod.category?.parent?.url ?? mod.category?.url ?? "global";

    return `/${catUrl}/mod/${mod.url}`;
}

export async function InsertUniqueView(prisma: PrismaClient, mod: ModViewItem, session?: Session) {
    if (!session?.user)
        return;

    // Insert unique mod view if we're signed in.
    await prisma.modUniqueView.upsert({
        where: {
            modId_userId: {
                userId: session.user.id,
                modId: mod.id
            }
        },
        create: {
            userId: session.user.id,
            modId: mod.id
        },
        update: {}
    })
}