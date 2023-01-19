import { z } from "zod";
import { router, publicProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"

export const permissionRouter = router({
    checkPerm: publicProcedure
        .input(z.object({
            userId: z.string(),
            perm: z.string()
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.permissions.findFirst({
                where: {
                    userId: input.userId,
                    perm: input.perm
                }
            });
        }),
    addUserPerm: publicProcedure
        .input(z.object({
            userId: z.string(),
            perm: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.permissions.create({
                    data: {
                        userId: input.userId,
                        perm: input.perm
                    }
                });
            } catch (error) {
                // Ignore error if it is due to existing entry.
                if (error.includes("constraint"))
                    return;
                
                throw new TRPCError({
                    message: error,
                    code: "BAD_RQEUEST"
                });
            }
        })
});