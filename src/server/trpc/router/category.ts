import { router, contributorProcedure } from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server"

import { z } from "zod";

import { Delete_Category, Insert_Or_Update_Category } from "@utils/content/category";

export const categoryRouter = router({
    add: contributorProcedure
        .input(z.object({
            id: z.number().optional(),
            parentId: z.number().nullable().default(null),

            description: z.string().optional(),
            name: z.string(),
            nameShort: z.string(),
            url: z.string(),
            classes: z.string().optional(),

            banner: z.string().optional(),
            icon: z.string().optional(),

            bremove: z.boolean().default(false),
            iremove: z.boolean().default(false),

            hasBg: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            // Use our helper funtion to insert our update category.
            const [cat, success, err] = await Insert_Or_Update_Category(ctx.prisma, input.name, input.nameShort, input.description, input.url, input.id ?? 0, input.icon, input.banner, input.iremove, input.bremove, input.parentId, input.classes, input.hasBg);

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
            const [success, err] = await Delete_Category(ctx.prisma, input.id);

            if (!success) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Received error when deleting category. Error => ${err}`
                });
            }
        })
});
