import { Prisma } from "@prisma/client";

const modWithRelations = Prisma.validator<Prisma.ModArgs>()({
    include: {
        category: true,
        ModDownload: true,
        ModScreenshot: true,
        ModSource: true,
        ModInstaller: true,
        ModCredit: true
    }
});

export type ModWithRelations = Prisma.ModGetPayload<typeof modWithRelations>;

export type ModRowBrowser = Prisma.ModGetPayload<{
    select: {
        id: true,
        url: true,
        ownerName: true,
        name: true,
        description: true,
        descriptionShort: true,
        install: true,

        banner: true,

        updateAt: true,
        createAt: true,
        editAt: true,
        needsRecounting: false,

        totalDownloads: true,
        totalViews: true,

        owner: true,
        
        category: {
            include: {
                parent: true
            }
        },
        ModSource: {
            include: {
                source: true
            }
        },
        ModDownload: true,
        ModScreenshot: true,
        ModInstaller: {
            include: {
                source: true
            }
        },
        ModRating: true
    }
}> & {
    rating?: number
};

// Mod view items.
export const ModViewItemInc = {
    category: {
        include: {
            parent: true
        },
    },
    ModSource: {
        include: {
            source: true
        }
    },
    ModDownload: true,
    ModInstaller: {
        include: {
            source: true
        }
    },
    ModRating: true,
    ModCredit: true
}

export type ModViewItem = Prisma.ModGetPayload<{
    include: typeof ModViewItemInc
}> & {
    rating?: number
}

export type ModWithRating = Prisma.ModGetPayload<{
    include: {
        ModRating: true
    }
}> & {
    rating?: number
}