import { router, contributorProcedure, publicProcedure } from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server"

import { z } from "zod";

import { DeleteCategory, InsertOrUpdateCategory } from "@utils/content/category";

export const categoryRouter = router({
    add: contributorProcedure
        .input(z.object({
            id: z.number().optional(),
            parentId: z.number().nullable().default(null),

            description: z.string().optional().nullable(),
            name: z.string(),
            nameShort: z.string(),
            url: z.string(),
            classes: z.string().optional().nullable(),

            banner: z.string().optional(),
            icon: z.string().optional(),

            bremove: z.boolean().default(false),
            iremove: z.boolean().default(false),

            hasBg: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            // Use our helper funtion to insert our update category.
            const [cat, success, err] = await InsertOrUpdateCategory ({
                prisma: ctx.prisma,

                lookupId: input.id,

                parentId: input.parentId,

                name: input.name,
                nameShort: input.nameShort,
                description: input.description,
                url: input.url,
                classes: input.classes,
                hasBg: input.hasBg,

                icon: input.icon,
                banner: input.banner,

                iremove: input.iremove,
                bremove: input.bremove
            });

            if (!success || !cat) {
                throw new TRPCError({
                    code: "PARSE_ERROR",
                    message: `Retrieved error when adding category. Error => ${err}`
                });
            }
        }),
    del: contributorProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            const [success, err] = await DeleteCategory ({
                prisma: ctx.prisma,
                id: input.id   
            });

            if (!success) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Received error when deleting category. Error => ${err}`
                });
            }
        }),
    getCategoryMappings: publicProcedure
        .input(z.object({
            cursor: z.number().nullish(),
            limit: z.number().default(10)
        }))
        .query(async ({ ctx, input }) => {
            const categories = await ctx.prisma.category.findMany({
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                include: {
                    children: true
                },
                where: {
                    parent: null
                }
            })

            let nextCat: typeof input.cursor | undefined = undefined;

            if (categories.length > input.limit) {
                const next = categories.pop();
                nextCat = next?.id;
            }

            return {
                categories,
                nextCat
            }
        })
});
