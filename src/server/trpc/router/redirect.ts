import { z } from "zod";
import { contributorProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

type ImportType = {
    url: string
    redirect: string
}

export const redirectRouter = router({
    getAll: contributorProcedure
        .input(z.object({
            cursor: z.string().nullish(),
            limit: z.number().max(10).default(10)
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
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Error ${input.id ? "saving" : "adding"} redirect. Error => ${err}.`
                })
            }
        }),
    del: contributorProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.redirect.delete({
                    where: {
                        id: input.id
                    }
                })
            } catch (err: unknown) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to delete redirect. Error => ${err}`
                })
            }
        }),
    import: contributorProcedure
        .input(z.object({
            contents: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const data: ImportType[] = [];

            try {
                const contents = input.contents;

                // Split contents by line.
                const lines = contents.split("\n");

                lines.forEach(line => {
                    // Split by colon.
                    const parts = line.split(":");

                    // Make sure we have two elements.
                    if (parts.length == 2) {
                        const url = parts[0]?.trim();
                        const redirect = parts[1]?.trim();

                        // Make sure they aren't empty.
                        if (!url || !redirect)
                            return;

                        data.push({
                            url: url,
                            redirect: redirect
                        })
                    }
                })

                // Make sure we have data to insert.
                if (data.length) {
                    await ctx.prisma.redirect.createMany({
                        data: data
                    })
                }
            } catch (err: unknown) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to import redirects. Error => ${err}.`
                })
            }
        })
})