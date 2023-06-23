import { z } from "zod";
import { router, publicProcedure, contributorProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"
import { Delete_Category, Insert_Or_Update_Category } from "../../../utils/content/category";

export const categoryRouter = router({
    getCategory: publicProcedure
        .input(z.object({
            id: z.number().nullable().default(null),
            url: z.string().nullable().default(null),
            parent: z.number().nullable().default(null),
            parentUrl: z.string().nullable().default(null),

            selId: z.boolean().default(false),
            selParentId: z.boolean().default(false),
            selName: z.boolean().default(false),
            selNameShort: z.boolean().default(false),
            selUrl: z.boolean().default(false),
            selClasses: z.boolean().default(false),
            selIcon: z.boolean().default(false),
            selHasBg: z.boolean().default(false),

            incParent: z.boolean().default(false),
            incChildren: z.boolean().default(false),
            incMods: z.boolean().default(false)
        }))
        .query(({ ctx, input }) => {
            if (input.id == null && input.url == null && input.parent == null)
                return null;

            return ctx.prisma.category.findFirst({
                select: {
                    id: input.selId,
                    parentId: input.selParentId,
                    name: input.selName,
                    nameShort: input.selNameShort,
                    url: input.selUrl,
                    classes: input.selClasses,
                    icon: input.selIcon,
                    hasBg: input.selHasBg,

                    children: input.incChildren,
                    parent: input.incParent,
                    Mod: input.incMods
                },
                where: {
                    ...(input.id != null && {
                        id: input.id
                    }),
                    ...(input.url != null && {
                        url: input.url
                    }),
                    ...(input.parent != null && {
                        parentId: input.parent
                    }),
                    ...(input.parentUrl != null && {
                        parent: {
                            url: input.parentUrl
                        }
                    })
                }
            });
        }),
    addCategory: contributorProcedure
        .input(z.object({
            id: z.number().nullable().default(null),
            parent_id: z.number().nullable().default(null),
            name: z.string(),
            name_short: z.string(),
            url: z.string(),
            icon: z.string().nullable().default(null),
            classes: z.string().nullable().default(null),

            iremove: z.boolean().nullable().default(false),

            has_bg: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            // Use our helper funtion to insert our update category.
            const [cat, success, err] = await Insert_Or_Update_Category(ctx.prisma, input.name, input.name_short, input.url, input.id ?? 0, input.icon ?? undefined, input.iremove ?? undefined, input.parent_id, input.classes, input.has_bg);

            if (!success || !cat) {
                throw new TRPCError({
                    code: "PARSE_ERROR",
                    message: err
                });
            }
        }),
    delCategory: contributorProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            const [success, error] = await Delete_Category(ctx.prisma, input.id);

            if (!success) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: error
                });
            }
        }),
    getCategoriesMapping: publicProcedure
        .input(z.object({
            selId: z.boolean().default(false),
            selParentId: z.boolean().default(false),
            selName: z.boolean().default(false),
            selNameShort: z.boolean().default(false),
            selUrl: z.boolean().default(false),
            selClasses: z.boolean().default(false),
            selIcon: z.boolean().default(false),
            selHasBg: z.boolean().default(false),

            incParent: z.boolean().default(false),
            incChildren: z.boolean().default(false),
            incMods: z.boolean().default(false),
            incModsCnt: z.boolean().default(false)
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.category.findMany({
                where: {
                    parentId: null
                },
                select: {
                    id: input.selId,
                    parentId: input.selParentId,
                    name: input.selName,
                    nameShort: input.selNameShort,
                    url: input.selUrl,
                    classes: input.selClasses,
                    icon: input.selIcon,
                    hasBg: input.selHasBg,

                    children: input.incChildren,
                    parent: input.incParent,
                    Mod: input.incMods,

                    ...(input.incModsCnt && {
                        _count: {
                            select: {
                                Mod: true
                            }
                        }
                    })
                },
            });
        }),
    getModCnt: publicProcedure
        .input(z.object({
            id: z.number()
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.category.findFirst({
                where: {
                    id: input.id
                },
                select: {
                    _count: {
                        select: {
                            Mod: true
                        }
                    }
                }
            });
        })
});
