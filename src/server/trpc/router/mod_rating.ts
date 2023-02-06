import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"

export const modRatingRouter = router({
    getModUserRating: publicProcedure
        .input(z.object({
            userId: z.string(),
            modId: z.number()
        }))
        .query(({ ctx, input}) => {
            if (input.userId.length < 1 || input.modId < 1)
                return null;
            
            return ctx.prisma.modRating.findFirst({
                where: {
                    userId: input.userId,
                    modId: input.modId
                }
            });
        }),
    addModUserRating: protectedProcedure
        .input(z.object({
            userId: z.string(),
            modId: z.number(),
            positive: z.boolean()
        }))
        .mutation(async ({ ctx, input }) => {
            if (input.userId.length < 1 || input.modId < 1)
                return;

            try {
                await ctx.prisma.modRating.upsert({
                    where: {
                        modId_userId: {
                            userId: input.userId,
                            modId: input.modId
                        }
                    },
                    create: {
                        userId: input.userId,
                        modId: input.modId,
                        positive: input.positive
                    },
                    update: {
                        positive: input.positive
                    }
                });
            } catch (error) {
                console.error("Error adding rating for user ID '" + input.userId + "' for mod ID #" + input.modId);
                console.error(error);

                throw new TRPCError({
                    code: "CONFLICT",
                    message: (typeof error == "string") ? error : ""
                });
            }

            // Require recounting now.
            try {
                await ctx.prisma.mod.update({
                    where: {
                        id: input.modId
                    },
                    data: {
                        needsRecounting: true
                    }
                });
            } catch (error) {
                console.error("Error requiring recount for mod ID #" + input.modId);
                console.error(error);

                throw new TRPCError({
                    code: "CONFLICT",
                    message: (typeof error == "string") ? error : ""
                });
            }
        })
});