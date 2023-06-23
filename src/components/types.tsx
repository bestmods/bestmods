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
        ModInstaller: true
    }
});

export type ModWithRelations = Prisma.ModGetPayload<typeof modWithRelations>;