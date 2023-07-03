import { z } from "zod";
import { router, publicProcedure, protectedProcedure, contributorProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"
import { Insert_Or_Update_Mod } from "../../../utils/content/mod";

export const modRouter = router({
    addMod: contributorProcedure
        .input(z.object({
            id: z.number().optional(),
            visible: z.boolean().default(true),

            owner_id: z.string().optional(),
            owner_name: z.string().optional(),

            name: z.string(),
            banner: z.string().optional(),
            url: z.string(),
            category: z.number().optional(),

            // The following should be parsed via Markdown Syntax.
            description: z.string(),
            description_short: z.string(),
            install: z.string().optional(),

            // The following should be parsed via JSON.
            downloads: z.array(z.object({
                name: z.string().nullable(),
                url: z.string(),

                // Required for ModDownload type.
                modId: z.number()
            })),
            screenshots: z.array(z.object({
                url: z.string(),

                // Required for ModScreenshot type.
                modId: z.number()
            })),
            sources: z.array(z.object({
                sourceUrl: z.string(),
                query: z.string(),

                // Required for ModSource type.
                modId: z.number(),
                primary: z.boolean()
            })),
            installers: z.array(z.object({
                sourceUrl: z.string(),
                url: z.string(),

                // Required for ModInstaller type.
                modId: z.number()
            })),
            credits: z.array(z.object({
                name: z.string(),
                credit: z.string(),

                // Required for ModCredit type.
                id: z.number(),
                modId: z.number(),
                userId: z.string().nullable()
            })),
            bremove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            // Insert ot update mod.
            const [mod, success, err] = await Insert_Or_Update_Mod(ctx.prisma, input.name, input.url, input.description, input.visible, input.id, undefined, input.owner_id, input.owner_name, input.banner, input.bremove, input.category, input.description_short, input.install, input.downloads, input.screenshots, input.sources, input.installers, input.credits);

            // Check for error.
            if (!success || !mod) {
                throw new TRPCError({
                    code: "PARSE_ERROR",
                    message: err
                });
            }
        }),
    setModVisibility: contributorProcedure
        .input(z.object({
            id: z.number(),
            visible: z.boolean().default(true)
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.mod.update({
                    where: {
                        id: input.id
                    },
                    data: {
                        visible: input.visible
                    }
                });
            } catch (error) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: (typeof error == "string") ? error : "Unable to set mod's visibility"
                });
            }
        }),
    delMod: contributorProcedure
        .input(z.object({
            id: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.mod.delete({
                    where: {
                        id: input.id
                    }
                });
            } catch (error) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: (typeof error == "string") ? error : "Unable to delete mod."
                });
            }
        }),
    getAllModsBrowser: publicProcedure
        .input(z.object({
            cursor: z.number().nullish(),
            count: z.number().default(10),

            categories: z.string().optional(),
            search: z.string().optional(),
            timeframe: z.number().default(0),
            sort: z.number().default(0),

            visible: z.boolean().default(false),
        }))
        .query(async ({ ctx, input }) => {
            const count = input.count;
            
            /*
            // Check if we want to retrieve mod rating within specific range.
            let time_range: number | null = null;

            if (input.timeframe) {
                switch (Number(input.timeframe)) {
                    case 0:
                        time_range = 3600;

                        break;

                    case 1:
                        time_range = 86400;

                        break;

                    case 2:
                        time_range = 604800;

                        break;

                    case 3:
                        time_range = 2629800;

                        break;

                    case 4:
                        time_range = 311556952;

                        break;

                    default:
                        time_range = null;
                }
            }

            let time_range_date: Date | null = null;

            if (time_range)
                time_range_date = new Date(Date.now() - time_range);
            */

            // Process categories.
            const catsArr = JSON.parse(input.categories ?? "[]");

            const items = await ctx.prisma.mod.findMany({
                where: {
                    ...(catsArr && catsArr.length > 0 && {
                        categoryId: {
                            in: catsArr
                        }
                    }),
                    ...(input.visible && {
                        visible: input.visible
                    }),
                    ...(input.search && {
                        OR: [
                            {
                                name: {
                                    contains: input.search,
                                    mode: "insensitive"
                                }
                            },
                            {
                                descriptionShort: {
                                    contains: input.search,
                                    mode: "insensitive"
                                }
                            },
                            {
                                ownerName: {
                                    contains: input.search,
                                    mode: "insensitive"
                                }
                            },
                            {
                                category: {
                                    name: {
                                        contains: input.search,
                                        mode: "insensitive"
                                    },
                                    nameShort: {
                                        contains: input.search,
                                        mode: "insensitive"
                                    }
                                }
                            }
                        ]
                    })
                },
                select: {
                    id: true,
                    url: true,
                    ownerName: true,
                    name: true,
                    description: true,
                    descriptionShort: true,
                    install: true,

                    banner: true,

                    updateAt: true,
                    createAt: true,
                    needsRecounting: false,

                    totalDownloads: true,
                    totalViews: true,
                    totalRating: true,

                    ratingHour: true,
                    ratingDay: true,
                    ratingWeek: true,
                    ratingMonth: true,
                    ratingYear: true,

                    owner: true,
                    category: {
                        include: {
                            parent: true
                        }
                    },

                    ModSource: {
                        include: {
                            source: true
                        }
                    },
                    ModDownload: true,
                    ModScreenshot: true,
                    ModInstaller: {
                        include: {
                            source: true
                        }
                    },
                    ModRating: {
                        where: {
                            userId: ctx.session?.user?.id ?? ""
                        }
                    }
                },
                orderBy: [
                    {
                        ...(input.sort == 0 && {
                            ...(input.timeframe == 0 && { ratingHour: "desc" }),
                            ...(input.timeframe == 1 && { ratingDay: "desc" }),
                            ...(input.timeframe == 2 && { ratingWeek: "desc" }),
                            ...(input.timeframe == 3 && { ratingMonth: "desc" }),
                            ...(input.timeframe == 4 && { ratingYear: "desc" }),
                            ...(input.timeframe == 5 && { totalRating: "desc" })
                        }),
                        ...(input.sort > 0 && {
                            ...(input.sort == 1 && { totalViews: "desc" }),
                            ...(input.sort == 2 && { totalDownloads: "desc" }),
                            ...(input.sort == 3 && { editAt: "desc" }),
                            ...(input.sort == 4 && { createAt: "desc" })
                        })
                    },
                    {
                        id: "desc"
                    }
                ],
                cursor: (input.cursor) ? { id: input.cursor } : undefined,
                take: count + 1
            });

            let nextCur: typeof input.cursor | undefined = undefined;

            if (items.length > count) {
                const nextItem = items.pop();
                nextCur = nextItem?.id;
            }

            return {
                items,
                nextCur
            };
        }),
    requireUpdate: protectedProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            await ctx.prisma.mod.update({
                where: {
                    id: input.id
                },
                data: {
                    needsRecounting: true
                }
            })
        })
});
