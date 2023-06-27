import { z } from "zod";
import { router, publicProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"

export const modDownloadRouter = router({
    incModDownloadCnt: publicProcedure
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
                        totalDownloads: {
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
        })
});