import { router, publicProcedure, contributorProcedure } from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server"

import { z } from "zod";

import { GetMods, InsertOrUpdateMod } from "@utils/content/mod";
import { ModWithRelationsInc, type ModWithRelations } from "~/types/mod";

export const modRouter = router({
    add: contributorProcedure
        .input(z.object({
            id: z.number().optional(),
            visible: z.boolean().default(true),

            ownerId: z.string().optional(),
            ownerName: z.string().optional(),

            name: z.string(),
            banner: z.string().optional(),
            url: z.string(),
            categoryId: z.number().optional(),

            // The following should be parsed via Markdown Syntax.
            description: z.string(),
            descriptionShort: z.string(),
            install: z.string().optional(),

            nsfw: z.boolean().default(false),
            autoUpdate: z.boolean().default(false),

            // Relation data (we try to replicate Prisma types for consistency).
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
            const [mod, success, err] = await InsertOrUpdateMod({
                prisma: ctx.prisma,

                lookupId: input.id,

                categoryId: input.categoryId,

                ownerId: input.ownerId,
                ownerName: input.ownerName,

                name: input.name,
                url: input.url,
                description: input.description,
                descriptionShort: input.descriptionShort,
                install: input.install,
                visible: input.visible,

                nsfw: input.nsfw,
                autoUpdate: input.autoUpdate,

                banner: input.banner,
                bremove: input.bremove,

                downloads: input.downloads,
                screenshots: input.screenshots,
                sources: input.sources,
                installers: input.installers,
                credits: input.credits
            });

            // Check for error.
            if (!success || !mod) {
                throw new TRPCError({
                    code: "PARSE_ERROR",
                    message: `Received error when adding mod. Error => ${err}`
                });
            }
        }),
    setVisibility: contributorProcedure
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
    del: contributorProcedure
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
    getAllBrowser: publicProcedure
        .input(z.object({
            cursor: z.number().nullish(),
            count: z.number().max(10).default(10),

            categories: z.array(z.number()).optional(),
            search: z.string().optional(),
            timeframe: z.number().default(0),
            sort: z.number().default(0),

            visible: z.boolean().default(true).optional(),
            incVisibleColumn: z.boolean().default(false)
        }))
        .query(async ({ ctx, input }) => {            
            // Check if we want to retrieve mod rating within specific range.
            let time_range: number | undefined = undefined;

            switch (input.timeframe) {
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
            }
        
            let time_range_date: Date | undefined = undefined;
        
            if (time_range) {
                time_range_date = new Date(Date.now() - (time_range * 1000));

                // We need to convert to UTC properly.
                time_range_date = new Date(
                    time_range_date.getUTCFullYear(),
                    time_range_date.getUTCMonth(),
                    time_range_date.getUTCDate(),
                    time_range_date.getUTCHours(),
                    time_range_date.getUTCMinutes(),
                    time_range_date.getUTCSeconds(),
                    time_range_date.getUTCMilliseconds()
                );
            }

            const [mods, nextMod] = await GetMods({
                isStatic: false,
                limit: input.count,
                cursor: input.cursor,
                ratingTimeRange: time_range_date,
                userId: ctx.session?.user?.id,
                categories: input.categories,
                search: input.search,
                visible: input.visible,
                sort: input.sort,
                incVisibleColumn: input.incVisibleColumn
            })

            return {
                mods,
                nextMod
            }
        }),
        mergeMod: contributorProcedure
            .input(z.object({
                id: z.number(),
                dstId: z.number(),
                delete: z.boolean().default(false),
                hide: z.boolean().default(true),
                mergeInstall: z.boolean().default(true),
                mergeOwnerName: z.boolean().default(true),
                mergeDescriptionShort: z.boolean().default(true),
                mergeSources: z.boolean().default(true),
                mergeDownloads: z.boolean().default(true),
                mergeInstallers: z.boolean().default(true),
                mergeScreenshots: z.boolean().default(true),
                mergeCredits: z.boolean().default(true)

            }))
            .mutation (async ({ ctx, input }) => {
                try {
                    // Retrieve mod source.
                    let mod: ModWithRelations | null = null;

                    try {
                        mod = await ctx.prisma.mod.findFirstOrThrow({
                            include: ModWithRelationsInc,
                            where: {
                                id: input.id
                            }
                        })
                    } catch (err: unknown) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: `Could not find mod source. Error => ${err}.`
                        })
                    }

                    // Retrieve mod destination.
                    let modDst: ModWithRelations | null = null;

                    try {
                        modDst = await ctx.prisma.mod.findFirstOrThrow({
                            include: ModWithRelationsInc,
                            where: {
                                id: input.dstId
                            }
                        })
                    } catch (err: unknown) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: `Could not find mod destination. Error => ${err}.`
                        })
                    }

                    // Update destination mod with source mod details.
                    await ctx.prisma.mod.update({
                        data: {
                            ...((input.mergeInstall && !modDst.install && mod.install) && {
                                install: mod.install
                            }),
                            ...((input.mergeOwnerName && !modDst.ownerName && mod.ownerName) && {
                                ownerName: mod.ownerName
                            }),
                            ...((input.mergeDescriptionShort && !modDst.descriptionShort && mod.descriptionShort) && {
                                descriptionShort: mod.descriptionShort
                            }),
                            ...(input.mergeSources && mod.ModSource.length > 0 && {
                                ModSource: {
                                    createMany: {
                                        data: mod.ModSource.map((src) => ({
                                            sourceUrl: src.sourceUrl,
                                            query: src.query,
                                            primary: src.primary
                                        }))
                                    }
                                }
                            }),
                            ...(input.mergeDownloads && mod.ModDownload.length > 0 && {
                                ModDownload: {
                                    createMany: {
                                        data: mod.ModDownload.map((dl) => ({
                                            name: dl.name,
                                            url: dl.url
                                        }))
                                    }
                                }
                            }),
                            ...(input.mergeInstallers && mod.ModInstaller.length > 0 && {
                                ModInstaller: {
                                    createMany: {
                                        data: mod.ModInstaller.map((ins) => ({
                                            sourceUrl: ins.sourceUrl,
                                            url: ins.url
                                        }))
                                    }
                                }
                            }),
                            ...(input.mergeScreenshots && mod.ModScreenshot.length > 0 && {
                                ModScreenshot: {
                                    createMany: {
                                        data: mod.ModScreenshot.map((ss) => ({
                                            url: ss.url
                                        }))
                                    }
                                }
                            }),
                            ...(input.mergeCredits && mod.ModCredit.length > 0 && {
                                ModCredit: {
                                    createMany: {
                                        data: mod.ModCredit.map((cre) => ({
                                            name: cre.name,
                                            credit: cre.credit
                                        }))
                                    }
                                }
                            })
                        },
                        where: {
                            id: input.dstId
                        }
                    })

                    // Check if we should delete or hide source mod.
                    if (input.delete) {
                        await ctx.prisma.mod.delete({
                            where: {
                                id: input.id
                            }
                        })
                    } else if (input.hide) {
                        await ctx.prisma.mod.update({
                            data: {
                                visible: false
                            },
                            where: {
                                id: input.id
                            }
                        })
                    }
                } catch (err: unknown) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `Failed to merge mods. Error => ${err}.`
                    })
                }
            })
})
