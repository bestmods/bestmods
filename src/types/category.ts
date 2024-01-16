import { type Prisma } from "@prisma/client";

export type CategoryWithChildren = Prisma.CategoryGetPayload<{
    include: {
        children: true
    }
}>

export type CategoryWithChildrenAndParent = Prisma.CategoryGetPayload<{
    include: {
        parent: true,
        children: true
    }
}>

export type CategoryWithChildrenAndParentAndCount = Prisma.CategoryGetPayload<{
    include: {
        _count: {
            select: {
                Mod: true
            }
        },
        parent: true,
        children: {
            include: {
                _count: {
                    select: {
                        Mod: true
                    }
                }
            }
        }
    }
}>

export type CategoryWithCount = Prisma.CategoryGetPayload<{
    include: {
        parent: true,
        _count: {
            select: {
                Mod: true
            }
        }
    }
}>

export type CategoryWithParentAndCount = Prisma.CategoryGetPayload<{
    include: {
        _count: {
            select: {
                Mod: true
            }
        },
        parent: true
    }
}>

export type CategoryWithChildrenAndCounts = Prisma.CategoryGetPayload<{
    include: {
        parent: true,
        children: {
            include: {
                parent: true,
                _count: {
                    select: {
                        Mod: true
                    }
                }
            }
        },
        _count: {
            select: {
                Mod: true
            }
        }
    }
}>

export type CategoryWithParent = Prisma.CategoryGetPayload<{
    include: {
        parent: true
    }
}>