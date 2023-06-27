import { z } from "zod";
import { router, contributorProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"
import { Delete_Source, Insert_Or_Update_Source } from "../../../utils/content/source";

export const sourceRouter = router({
    addSource: contributorProcedure
        .input(z.object({
            update: z.boolean().default(false),
            name: z.string(),
            url: z.string(),
            icon: z.string().nullable().default(null),
            banner: z.string().nullable().default(null),
            classes: z.string().nullable().default(null),
            iremove: z.boolean().default(false),
            bremove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const [src, success, err] = await Insert_Or_Update_Source(ctx.prisma, input.url, input.update, input.icon ?? undefined, input.iremove, input.banner ?? undefined, input.bremove, input.name, input.classes);

            if (!success || !src) {
                throw new TRPCError({
                    code: "PARSE_ERROR",
                    message: err
                });
            }
        }),
    delSource: contributorProcedure
        .input(z.object({
            url: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const [success, error] = await Delete_Source(ctx.prisma, input.url);

            if (!success) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: error
                });
            }
        })
});
