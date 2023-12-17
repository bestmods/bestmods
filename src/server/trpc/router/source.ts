import { router, adminProcedure } from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server"

import { z } from "zod";

import { DeleteSource, InsertOrUpdateSource } from "@utils/content/source";

export const sourceRouter = router({
    add: adminProcedure
        .input(z.object({
            update: z.boolean().default(false),
            name: z.string(),
            description: z.string().optional().nullable(),
            url: z.string(),
            icon: z.string().optional(),
            banner: z.string().optional(),
            classes: z.string().optional().nullable(),
            iremove: z.boolean().default(false),
            bremove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const [src, success, err] = await InsertOrUpdateSource ({
                prisma: ctx.prisma,

                url: input.url,
                
                update: input.update,

                name: input.name,
                description: input.description,
                classes: input.classes,

                icon: input.icon,
                banner: input.banner,

                iremove: input.iremove,
                bremove: input.bremove
            });
        
            if (!success || !src) {
                throw new TRPCError({
                    code: "PARSE_ERROR",
                    message: `Received error when adding source. Error => ${err}`
                });
            }
        }),
    del: adminProcedure
        .input(z.object({
            url: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const [success, err] = await DeleteSource ({
                prisma: ctx.prisma,
                url: input.url
            });

            if (!success) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Received error when deleting source. Error => ${err}`
                });
            }
        })
});
