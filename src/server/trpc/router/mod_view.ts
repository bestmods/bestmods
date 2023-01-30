import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"

export const modViewRouter = router({
    incModViewCnt: publicProcedure
        .input(z.object({
            url: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            if (input.url.length < 1)
                return;
                
            try {
                await ctx.prisma.mod.update({
                    where: {
                        url: input.url
                    },
                    data: {
                        totalViews: {
                            increment: 1
                        }
                    }
                });
            } catch (error) {
                throw new TRPCError({
                    message: (typeof error == "string") ? error : "",
                    code: "BAD_REQUEST"
                });
            }
        }),
        addModUniqueView: protectedProcedure
            .input(z.object({
                userId: z.string(),
                modId: z.number()
            }))
            .mutation(async ({ ctx, input}) => {
                try {
                    await ctx.prisma.modUniqueView.create({
                        data: {
                            modId: input.modId,
                            userId: input.userId
                        }
                    });
                } catch (error) {
                    if (typeof error === "string" && error.includes("constraint"))
                        return;

                    throw new TRPCError({
                        message: (typeof error == "string") ? error : "",
                        code: "BAD_REQUEST"
                    });
                }
            })
});