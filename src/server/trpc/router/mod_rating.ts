import { router, protectedProcedure } from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server"

import { z } from "zod";

export const modRatingRouter = router({
    add: protectedProcedure
        .input(z.object({
            userId: z.string().min(1),
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
            } catch (err: unknown) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `Error adding mod rating. Error => ${err}.`
                });
            }
        })
});