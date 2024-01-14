import { TRPCError } from "@trpc/server";
import { adminProcedure, protectedProcedure, router } from "../trpc";

import { z } from "zod";
import { ReportStatus } from "@prisma/client";

export const modReportRouter = router({
    getMyReports: protectedProcedure
        .input(z.object({
            limit: z.number().max(10).default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const reports = await ctx.prisma.modReport.findMany({
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                include: {
                    user: true,
                    mod: true
                },
                where: {
                    userId: ctx.session.user.id
                }
            })

            let nextCur: typeof input.cursor | undefined = undefined;

            if (reports.length > input.limit) {
                const next = reports.pop();

                if (next)
                    nextCur = next.id;
            }

            return {
                reports,
                nextCur
            }
        }),
    add: protectedProcedure
        .input(z.object({
            modId: z.number(),
            contents: z.string().max(4096)
        }))
        .mutation(async ({ ctx, input }) => {
            // Make sure we haven't created too many reports in the last minute.
            const curDate = new Date();
            const minAgo = new Date(curDate.getTime() - 60000);

            const reportCnt = await ctx.prisma.modReport.count({
                where: {
                    userId: ctx.session.user.id,
                    createdAt: {
                        gte: minAgo
                    }
                }
            })

            if (reportCnt > 2) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "You have reported too many mods in a minute. You can only report 2 mods per minute."
                })
            }

            try {
                await ctx.prisma.modReport.create({
                    data: {
                        modId: input.modId,
                        userId: ctx.session.user.id,
                        contents: input.contents
                    }
                })
            } catch (err: unknown) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to create report. Error => ${err}.`
                })
            }
        }),
    getAll: adminProcedure
        .input(z.object({
            limit: z.number().max(10).default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const reports = await ctx.prisma.modReport.findMany({
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                include: {
                    user: true,
                    mod: true
                }
            })

            let nextCur: typeof input.cursor | undefined;

            if (reports.length > input.limit) {
                const next = reports.pop();

                if (next)
                    nextCur = next.id;
            }

            return {
                reports,
                nextCur
            }
        }),
    setStatus: adminProcedure
        .input(z.object({
            id: z.number(),
            status: z.nativeEnum(ReportStatus)
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.modReport.update({
                    data: {
                        status: input.status
                    },
                    where: {
                        id: input.id
                    }
                })
            } catch (err: unknown) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Error setting report status. Error => ${err}.`
                })
            }
        })
})