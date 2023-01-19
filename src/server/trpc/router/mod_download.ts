import { z } from "zod";
import { router, publicProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"

export const modDownloadRouter = router({
    incModDownloadCnt: publicProcedure
        .input(z.object({
            url: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
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
                    message: error,
                    code: "BAD_REQUEST"
                });
            }
        }),
    getModDownloads: publicProcedure
        .input(z.object({
            id: z.number()
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.modDownload.findMany({
                where: {
                    modId: input.id
                }
            })
        }),
    addModDownload: publicProcedure
        .input(z.object({
            modId: z.number(),
            name: z.string(),
            url: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.modDownload.upsert({
                    where: {
                        modId_url: {
                            modId: input.modId,
                            url: input.url
                        }
                    },
                    create: {
                        modId: input.modId,
                        name: input.name,
                        url: input.url
                    },
                    update: {
                        name: input.name
                    }
                });
            } catch (error) {
                console.error("Error adding mod download for mod ID '" + input.modId + "' for URL '" + input.url + "'.");
                console.error(error);

                throw new TRPCError({
                    code: "CONFLICT",
                    message: error
                })
            }
        })
});