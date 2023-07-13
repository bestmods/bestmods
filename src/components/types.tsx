import { Prisma } from "@prisma/client";

const categoriesWithChildren = Prisma.validator<Prisma.CategoryArgs>()({include: {
        children: true
}});

export type CategoriesWithChildren = Prisma.CategoryGetPayload<typeof categoriesWithChildren>;

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

const modRowBrowser = Prisma.validator<Prisma.ModArgs>()({
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
});

export type ModRowBrowser = Prisma.ModGetPayload<typeof modRowBrowser> & {
    rating?: number
};