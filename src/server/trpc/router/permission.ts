import { router, adminProcedure } from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server"

import { z } from "zod";

export const permissionRouter = router({
    addUserPerm: adminProcedure
        .input(z.object({
            id: z.string(),
            perm: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.permissions.create({
                    data: {
                        userId: input.id,
                        perm: input.perm
                    }
                });
            } catch (error) {
                throw new TRPCError({
                    message: (typeof error == "string") ? error : "Error inserting permission '" + input.perm + "' for user.",
                    code: "BAD_REQUEST"
                });
            }
        }),
    delUserPerm: adminProcedure
        .input(z.object({
            id: z.string(),
            perm: z.string()
        }))
        .mutation(async ({ ctx, input}) => {
            try {
                await ctx.prisma.permissions.delete({
                    where: {
                        perm_userId: {
                            userId: input.id,
                            perm: input.perm
                        }
                    }
                });
            } catch (error) {
                throw new TRPCError({
                    message: (typeof error == "string") ? error : "Error deleting permission '" + input.perm + "' for user.",
                    code: "BAD_REQUEST"
                });
            }
        }),
    retrieveUserPerms: adminProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.permissions.findMany({
                where: {
                    userId: input.id
                }
            });
        })
});