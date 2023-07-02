import { z } from "zod";
import { router, publicProcedure, protectedProcedure, contributorProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"
import { type ModCredit, type ModDownload, type ModInstaller, type ModScreenshot, type ModSource } from "@prisma/client";
import { Insert_Or_Update_Mod } from "../../../utils/content/mod";

export const modRouter = router({
    addMod: contributorProcedure
        .input(z.object({
            id: z.number().nullable().default(null),
            visible: z.boolean().default(true),

            owner_id: z.string().nullable().default(null),
            owner_name: z.string().nullable().default(null),

            name: z.string(),
            banner: z.string().nullable().default(null),
            url: z.string(),
            category: z.number().nullable().default(null),

            // The following should be parsed via Markdown Syntax.
            description: z.string(),
            description_short: z.string(),
            install: z.string().nullable().default(null),

            // The following should be parsed via JSON.
            downloads: z.string().nullable().default(null),
            screenshots: z.string().nullable().default(null),
            sources: z.string().nullable().default(null),
            installers: z.string().nullable().default(null),
            credits: z.string().optional(),

            bremove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            /* To Do: Perhaps simplify the below and create globally used types so we don't have to reparse? */
            // Parse downloads from input and put it into ModDownload type.
            const downloads: ModDownload[] = [];
            
            if (input.downloads) {
                const json = JSON.parse(input.downloads ?? "[]");

                json.forEach(({ name, url}  : { name: string, url: string}) => {
                    if (!name || !url)
                        return;

                    const new_item: ModDownload = {
                        modId: 0,
                        name: name,
                        url: url
                    };

                    downloads.push(new_item)
                });
            }

            // Parse screenshots from input and put into ModScreenshot type.
            const screenshots: ModScreenshot[] = [];

            if (input.screenshots) {
                const json = JSON.parse(input.screenshots ?? "[]");

                json.forEach(({ url } : { url: string }) => {
                    if (!url)
                        return;

                    const new_item: ModScreenshot = {
                        modId: 0,
                        url: url
                    };

                    screenshots.push(new_item);
                });
            }

            // Parse sources from input and put into ModSource type.
            const sources: ModSource[] = [];

            if (input.sources) {
                const json = JSON.parse(input.sources ?? "[]");

                json.forEach(({ url, query } : { url: string, query: string }) => {
                    if (!url || !query)
                        return;

                    const new_item: ModSource = {
                        modId: 0,
                        primary: false,
                        sourceUrl: url,
                        query: query
                    };

                    sources.push(new_item);
                })
            }

            // Parse installers from input and put into ModInstaller type.
            const installers: ModInstaller[] = [];

            if (input.installers) {
                const json = JSON.parse(input.installers ?? "[]");

                json.forEach(({ src_url, url } : { src_url: string, url: string }) => {
                    if (!src_url || !url)
                        return;

                    const new_item: ModInstaller = {
                        modId: 0,
                        sourceUrl: src_url,
                        url: url
                    };

                    installers.push(new_item);
                })
            }

            // Parse credits from input and put into ModCredit type.
            const credits: ModCredit[] = [];

            if (input.credits) {
                const json = JSON.parse(input.credits ?? "[]");

                json.forEach(({ name, credit } : { name: string, credit: string }) => {
                    if (!name || !credit)
                        return;

                    const new_item: ModCredit = {
                        id:  0,
                        modId: 0,
                        userId: "",
                        name: name,
                        credit: credit
                    };

                    credits.push(new_item);
                });
            }

            // Insert ot update mod.
            const [mod, success, err] = await Insert_Or_Update_Mod(ctx.prisma, input.name, input.url, input.description, input.visible, input.id ?? undefined, undefined, input.owner_id ?? undefined, input.owner_name ?? undefined, input.banner ?? undefined, input.bremove, input.category, input.description_short, input.install ?? undefined, downloads, screenshots, sources, installers, credits);

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

            categories: z.string().nullable().default(null),
            search: z.string().nullable().default(null),
            timeframe: z.number().nullable().default(null),
            sort: z.number().nullable().default(null),

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
                        ...(input.sort != null && input.sort == 0 && {
                            ...(input.timeframe == 0 && { ratingHour: "desc" }),
                            ...(input.timeframe == 1 && { ratingDay: "desc" }),
                            ...(input.timeframe == 2 && { ratingWeek: "desc" }),
                            ...(input.timeframe == 3 && { ratingMonth: "desc" }),
                            ...(input.timeframe == 4 && { ratingYear: "desc" }),
                            ...(input.timeframe == 5 && { totalRating: "desc" })
                        }),
                        ...(input.sort != null && input.sort > 0 && {
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
