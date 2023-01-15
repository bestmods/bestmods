import { z } from "zod";
import { router, publicProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"
import { trpc } from "../../../utils/trpc";
import { TRPCClientError } from "@trpc/client";

export const ratingRouter = router({
    getRatingsForMod: publicProcedure
        .input(z.object({
            url: z.string(),
            dateStart: z.date().nullable(),
            dateEnd: z.date().nullable()
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.modRating.findMany({
                where: {
                    ...(input.dateStart != null && { 
                        createdAt: {
                            gte: input.dateStart
                        }
                    }),
                    ...(input.dateEnd != null && {
                        createdAt: {
                            lte: input.dateEnd
                        }
                    })
                }
            })
        }),
    getUserRatingForMod: publicProcedure
        .input(z.object({
            userId: z.string(),
            modId: z.number()
        }))
        .query(({ ctx, input}) => {
            return ctx.prisma.modRating.findFirst({
                where: {
                    userId: input.userId,
                    modId: input.modId
                }
            });
        }),
    addUserRating: publicProcedure
        .input(z.object({
            userId: z.string(),
            modId: z.number(),
            positive: z.boolean()
        }))
        .mutation(async ({ ctx, input }) => {
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
                    message: error
                })
            }
        })
});