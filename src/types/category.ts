import { Prisma } from "@prisma/client";

const categoriesWithChildren = Prisma.validator<Prisma.CategoryArgs>()({include: {
    children: true
}});

export type CategoriesWithChildren = Prisma.CategoryGetPayload<typeof categoriesWithChildren>;