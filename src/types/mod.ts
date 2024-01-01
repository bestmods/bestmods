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

export const ModRowBrowserSel = {
    id: true,
    visible: true,
    
    url: true,
    ownerName: true,
    name: true,
    description: true,
    descriptionShort: true,
    install: true,

    banner: true,

    updateAt: false,
    createAt: false,
    editAt: false,
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

export type ModRowBrowser = Prisma.ModGetPayload<{
    select: typeof ModRowBrowserSel
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
    ModCredit: true,
    ModScreenshot: true
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