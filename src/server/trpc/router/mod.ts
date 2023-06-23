import { string, z } from "zod";
import { router, publicProcedure, protectedProcedure, contributorProcedure } from "../trpc";

import fs from 'fs';
import FileType from '../../../utils/base64';
import { TRPCError } from "@trpc/server"
import { ModDownload, ModInstaller, ModScreenshot, ModSource } from "@prisma/client";
import { Insert_Or_Update_Mod } from "../../../utils/content/mod";

export const modRouter = router({
    getMod: publicProcedure
        .input(z.object({
            url: z.string().nullable(),
            visible: z.boolean().nullable(),

            selId: z.boolean().default(false),
            selUrl: z.boolean().default(false),
            selOwnerName: z.boolean().default(false),
            selName: z.boolean().default(false),
            selDescription: z.boolean().default(false),
            selDescriptionShort: z.boolean().default(false),
            selInstall: z.boolean().default(false),

            selBanner: z.boolean().default(false),

            selCreateAt: z.boolean().default(false),
            selUpdateAt: z.boolean().default(false),
            selNeedsRecounting: z.boolean().default(false),

            selTotalDownloads: z.boolean().default(false),
            selTotalViews: z.boolean().default(false),
            selTotalRating: z.boolean().default(false),

            selRatingHour: z.boolean().default(false),
            selRatingDay: z.boolean().default(false),
            selRatingWeek: z.boolean().default(false),
            selRatingMonth: z.boolean().default(false),
            selRatingYear: z.boolean().default(false),

            incOwner: z.boolean().default(false),
            incCategory: z.boolean().default(false),
            incSources: z.boolean().default(false),
            incDownloads: z.boolean().default(false),
            incScreenshots: z.boolean().default(false),
            incRatings: z.boolean().default(false),
            incUniqueViews: z.boolean().default(false),
            incCollections: z.boolean().default(false),
            incComments: z.boolean().default(false),
            incInstallers: z.boolean().default(false)

        }))
        .query(({ ctx, input }) => {
            if (!input.url || input.url.length < 1)
                return null;

            return ctx.prisma.mod.findFirst({
                where: {
                    url: input.url,
                    ...(input.visible != null && {
                        visible: input.visible
                    })
                },
                select: {
                    id: input.selId,
                    url: input.selUrl,
                    ownerName: input.selOwnerName,
                    name: input.selName,
                    description: input.selDescription,
                    descriptionShort: input.selDescriptionShort,
                    install: input.selInstall,

                    banner: input.selBanner,

                    updateAt: input.selUpdateAt,
                    createAt: input.selCreateAt,
                    needsRecounting: input.selNeedsRecounting,

                    totalDownloads: input.selTotalDownloads,
                    totalViews: input.selTotalViews,
                    totalRating: input.selTotalRating,

                    ratingHour: input.selRatingHour,
                    ratingDay: input.selRatingDay,
                    ratingWeek: input.selRatingWeek,
                    ratingMonth: input.selRatingMonth,
                    ratingYear: input.selRatingYear,

                    owner: input.incOwner,
                    ownerId: input.incOwner,

                    category: input.incCategory,
                    categoryId: input.incCategory,

                    ModSource: input.incSources,
                    ModDownload: input.incDownloads,
                    ModScreenshot: input.incScreenshots,
                    ModRating: input.incRatings,
                    ModUniqueView: input.incUniqueViews,
                    ModCollections: input.incCollections,
                    ModComment: input.incComments,
                    ModInstaller: input.incInstallers
                }
            });
        }),
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

            bremove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            /* To Do: Perhaps simplify the below and create globally used types so we don't have to reparse? */
            // Parse downloads from input and put it into ModDownload type.
            const downloads: ModDownload[] = [];
            
            if (input.downloads) {
                const json = JSON.parse(input.downloads ?? "[]");

                json.forEach(({name, url} : { name: string, url: string}) => {
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

                json.forEach(({ srcUrl, url } : { srcUrl: string, url: string }) => {
                    const new_item: ModInstaller = {
                        modId: 0,
                        sourceUrl: srcUrl,
                        url: url
                    };

                    installers.push(new_item);
                })
            }

            // Insert ot update mod.
            const [mod, success, err] = await Insert_Or_Update_Mod(ctx.prisma, input.name, input.url, input.description, input.visible, input.id ?? undefined, undefined, input.owner_id ?? undefined, input.owner_name ?? undefined, input.banner ?? undefined, input.bremove, input.category, input.description_short, input.install ?? undefined, downloads, screenshots, sources, installers);

            // Check for error.
            if (!success || !mod) {
                throw new TRPCError({
                    code: "PARSE_ERROR",
                    message: err
                });
            }
        }),
    getAllModsBrowser: publicProcedure
        .input(z.object({
            cursor: z.number().nullish(),
            count: z.number().nullable(),

            categories: z.string().nullable(),
            search: z.string().nullable(),
            timeframe: z.number().nullable(),
            sort: z.number().nullable(),

            visible: z.boolean().nullable(),

            selId: z.boolean().default(false),
            selUrl: z.boolean().default(false),
            selOwnerName: z.boolean().default(false),
            selName: z.boolean().default(false),
            selDescription: z.boolean().default(false),
            selDescriptionShort: z.boolean().default(false),
            selInstall: z.boolean().default(false),

            selBanner: z.boolean().default(false),

            selCreateAt: z.boolean().default(false),
            selUpdateAt: z.boolean().default(false),
            selNeedsRecounting: z.boolean().default(false),

            selTotalDownloads: z.boolean().default(false),
            selTotalViews: z.boolean().default(false),
            selTotalRating: z.boolean().default(false),

            selRatingHour: z.boolean().default(false),
            selRatingDay: z.boolean().default(false),
            selRatingWeek: z.boolean().default(false),
            selRatingMonth: z.boolean().default(false),
            selRatingYear: z.boolean().default(false),

            incOwner: z.boolean().default(false),
            incCategory: z.boolean().default(false),
            incSources: z.boolean().default(false),
            incDownloads: z.boolean().default(false),
            incScreenshots: z.boolean().default(false),
            incRatings: z.boolean().default(false),
            incUniqueViews: z.boolean().default(false),
            incCollections: z.boolean().default(false),
            incComments: z.boolean().default(false),
            incInstallers: z.boolean().default(false)
        }))
        .query(async ({ ctx, input }) => {
            const count = (typeof input.count === 'number' && !isNaN(input.count)) ? input.count : 10;

            // Process categories.
            const catsArr = JSON.parse(input.categories ?? "[]");

            const items = await ctx.prisma.mod.findMany({
                where: {
                    ...(catsArr && catsArr.length > 0 && { categoryId: { in: catsArr } }),
                    ...(input.visible != null && { visible: input.visible }),
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
                    id: input.selId,
                    url: input.selUrl,
                    ownerName: input.selOwnerName,
                    name: input.selName,
                    description: input.selDescription,
                    descriptionShort: input.selDescriptionShort,
                    install: input.selInstall,

                    banner: input.selBanner,

                    updateAt: input.selUpdateAt,
                    createAt: input.selCreateAt,
                    needsRecounting: input.selNeedsRecounting,

                    totalDownloads: input.selTotalDownloads,
                    totalViews: input.selTotalViews,
                    totalRating: input.selTotalRating,

                    ratingHour: input.selRatingHour,
                    ratingDay: input.selRatingDay,
                    ratingWeek: input.selRatingWeek,
                    ratingMonth: input.selRatingMonth,
                    ratingYear: input.selRatingYear,

                    owner: input.incOwner,
                    category: input.incCategory,

                    ModSource: input.incSources,
                    ModDownload: input.incDownloads,
                    ModScreenshot: input.incScreenshots,
                    ModRating: input.incRatings,
                    ModUniqueView: input.incUniqueViews,
                    ModCollections: input.incCollections,
                    ModComment: input.incComments,
                    ModInstaller: input.incInstallers
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
                            ...(input.sort == 3 && { updateAt: "desc" }),
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
