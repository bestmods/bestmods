import { router, contributorProcedure } from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server"

import { z } from "zod";

import { Delete_Source, Insert_Or_Update_Source } from "@utils/content/source";

export const sourceRouter = router({
    add: contributorProcedure
        .input(z.object({
            update: z.boolean().default(false),
            name: z.string(),
            description: z.string().optional(),
            url: z.string(),
            icon: z.string().optional(),
            banner: z.string().optional(),
            classes: z.string().optional(),
            iremove: z.boolean().default(false),
            bremove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const [src, success, err] = await Insert_Or_Update_Source(ctx.prisma, input.url, input.update, input.icon, input.iremove, input.banner, input.bremove, input.name, input.description, input.classes);

            if (!success || !src) {
                throw new TRPCError({
                    code: "PARSE_ERROR",
                    message: `Received error when adding source. Error => ${err}`
                });
            }
        }),
    del: contributorProcedure
        .input(z.object({
            url: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const [success, err] = await Delete_Source(ctx.prisma, input.url);

            if (!success) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Received error when deleting source. Error => ${err}`
                });
            }
        })
});
