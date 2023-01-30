import { z } from "zod";
import { router, protectedProcedure, contributorProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"

export const permissionRouter = router({
    checkPerm: protectedProcedure
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
    addUserPerm: contributorProcedure
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
                if (typeof error === "string" && error.includes("constraint"))
                    return;
                
                throw new TRPCError({
                    message: (typeof error == "string") ? error : "",
                    code: "BAD_REQUEST"
                });
            }
        })
});