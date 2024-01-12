import { z } from "zod";
import { contributorProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const redirectRouter = router({
    getAll: contributorProcedure
        .input(z.object({
            cursor: z.string().nullish(),
            limit: z.number().default(10)
        }))
        .query(async ({ ctx, input }) => {
            const redirects = await ctx.prisma.redirect.findMany({
                take: input.limit + 1,
                cursor: input.cursor ? { url: input.cursor } : undefined
            })

            let nextCur: typeof input.cursor | undefined = undefined;

            if (redirects.length > input.limit) {
                const next = redirects.pop();

                if (next)
                    nextCur = next.url;
            }

            return {
                redirects,
                nextCur
            }
        }),
    addOrSave: contributorProcedure
        .input(z.object({
            id: z.number().optional(),
            url: z.string().min(2),
            redirect: z.string().min(2)
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                if (input.id) {
                    await ctx.prisma.redirect.update({
                        data: {
                            url: input.url,
                            redirect: input.redirect
                        },
                        where: {
                            id: input.id
                        }
                    })
                } else {
                    await ctx.prisma.redirect.create({
                        data: {
                            url: input.url,
                            redirect: input.redirect
                        }
                    })
                }
            } catch (err: unknown) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Error ${input.id ? "saving" : "adding"} redirect. Error => ${err}.`
                })
            }
        })
})