import { router, contributorProcedure } from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server"

import { z } from "zod";

import { Delete_Category, Insert_Or_Update_Category } from "@utils/content/category";

export const categoryRouter = router({
    addCategory: contributorProcedure
        .input(z.object({
            id: z.number().optional(),
            parent_id: z.number().nullable().default(null),
            description: z.string().optional(),
            name: z.string(),
            name_short: z.string(),
            url: z.string(),
            icon: z.string().optional(),
            classes: z.string().optional(),

            iremove: z.boolean().default(false),

            has_bg: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            // Use our helper funtion to insert our update category.
            const [cat, success, err] = await Insert_Or_Update_Category(ctx.prisma, input.name, input.name_short, input.description, input.url, input.id ?? 0, input.icon, input.iremove, input.parent_id, input.classes, input.has_bg);

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
        })
});
