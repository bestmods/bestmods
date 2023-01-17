import { z } from "zod";
import { router, publicProcedure } from "../trpc";

import fs from 'fs';
import FileType from '../../../utils/base64';
import { TRPCError } from "@trpc/server"

export const modRouter = router({
    getMod: publicProcedure
        .input(z.object({
            url: z.string()
        }))
        .query(({ ctx, input}) => {
            return ctx.prisma.mod.findFirst({
                    include: {
                        category: true,
                        ModDownload: true,
                        ModScreenshot: true,
                        ModSource: true
                    },
                    where: {
                        url: input.url
                    }
            });
        }),
    addMod: publicProcedure
        .input(z.object({
            id: z.number(),
            name: z.string(),
            banner: z.string().nullable(),
            url: z.string(),
            category: z.number(),

            // The following should be parsed via Markdown Syntax.
            description: z.string(),
            description_short: z.string(),
            install: z.string().nullable(),

            // The following should be parsed via JSON.
            downloads: z.string().nullable(),
            screenshots: z.string().nullable(),
            sources: z.string().nullable(),

            bremove: z.boolean().nullable()
        }))
        .mutation(async ({ ctx, input }) => {
            // First, we want to insert the mod into the database.
            let mod = null;

            console.log("Got to mutation");

            // Make sure we have text in required fields.
            if (input.url.length < 1 || input.name.length < 1 || input.description.length < 1) {
                let err = "URL is empty.";
                
                if (input.name.length < 1)
                    err = "Name is empty.";

                if (input.description.length < 1)
                    err = "Description is empty.";

                console.error(err);

                throw new TRPCError({ 
                    code: "CONFLICT",
                    message: err
                });
            }

            // Let's now handle file uploads.
            let bannerPath: string | boolean | null = false;

            if (input.bremove) {
                console.log("BANNER REMOVE SET");
                bannerPath = null;
            }

            if (input.banner != null && input.banner.length > 0 && !input.bremove) {
                const base64Data = input.banner.split(',')[1];

                if (base64Data != null) {
                    // Retrieve file type.
                    const fileExt = FileType(base64Data);

                    // Make sure we don't have an-++ unknown file type.
                    if (fileExt != "unknown") {
                        // Now let's compile our file name.
                        const fileName = input.url + "." + fileExt;

                        // Set icon path.
                        bannerPath = "/images/mod/" + fileName;

                        // Convert to binary from base64.
                        const buffer = Buffer.from(base64Data, 'base64');

                        // Write file to disk.
                        try {
                            fs.writeFileSync(process.env.PUBLIC_DIR + "/" + bannerPath, buffer);
                        } catch (error) {
                            console.error("Error writing banner to disk.");
                            console.error(error);

                            throw new TRPCError({ 
                                code: "PARSE_ERROR",
                                message: error
                            });
                        }
                    } else {
                        console.error("Banner's file extension is unknown.");

                        throw new TRPCError({ 
                            code: "PARSE_ERROR",
                            message: "Unknown file extension for banner."
                        });
                    }
                } else {
                    console.error("Parsing base64 data is null.");

                    throw new TRPCError({ 
                        code: "PARSE_ERROR",
                        message: "Unable to process banner's Base64 data."
                    });
                }
            }

            console.log("Banner  data");
            console.log(bannerPath);

            try {
                mod = await ctx.prisma.mod.upsert({
                    where: {
                        id: input.id
                    },
                    update: {
                        name: input.name,
                        url: input.url,
                        categoryId: input.category,

                        description: input.description,
                        description_short: input.description_short,
                        install: input.install,

                        ...(bannerPath !== false && {
                            banner: bannerPath
                        })
                    },
                    create: {
                        name: input.name,
                        url: input.url,
                        categoryId: input.category,

                        description: input.description,
                        description_short: input.description_short,
                        install: input.install,

                        ...(bannerPath !== false && {
                            banner: bannerPath
                        })
                    }
                });
            } catch (error) {
                console.error("Error creating or updating mod.");
                console.error(error);

                throw new TRPCError({ 
                    code: "CONFLICT",
                    message: error
                });
            }

            if (mod != null) {
                // For now, we want to clear out all relation data to our mod before re-updating with how our form and React setup works.
                try {
                    await ctx.prisma.modDownload.deleteMany({
                        where: {
                           modId: mod.id
                        }
                    });

                    await ctx.prisma.modScreenshot.deleteMany({
                        where: {
                            modId: mod.id
                        }
                    });

                    await ctx.prisma.modSource.deleteMany({
                        where: {
                            modId: mod.id
                        }
                    });
                } catch (error) {
                    // Log, but keep continuing.
                    console.error("Error deleting relations for Mod ID #" + mod.id);
                }

                // Handle downloads relation.
                const downloads = JSON.parse(input.downloads ?? "[]");

                // Loop through downloads.
                downloads.forEach(async ({ name, url }: { name: string, url: string }) => {
                    await ctx.prisma.modDownload.upsert({
                        where: {
                            modId_url: {
                                modId: mod.id,
                                url: url
                            }
                        },
                        create: {
                            modId: mod.id,
                            name: name,
                            url: url
                        },
                        update: {
                            name: name,
                            url: url
                        }
                    });
                });

                // Handle screenshots relation.
                const screenshots = JSON.parse(input.screenshots ?? "[]");

                // Loop through screenshots.
                screenshots.forEach(async ({ url }: { url: string }) => {
                    await ctx.prisma.modScreenshot.upsert({
                        where: {
                            modId_url: {
                                modId: mod.id,
                                url: url
                            }
                        },
                        create: {
                            modId: mod.id,
                            url: url
                        },
                        update: {
                            url: url
                        }
                    });
                });

                // Handle sources relation.
                const sources = JSON.parse(input.sources ?? "[]");

                // Loop through sources.
                sources.forEach(async ({ url, query }: { url: string, query: string }) => {
                    await ctx.prisma.modSource.upsert({
                        where: {
                            modId_sourceUrl: {
                                modId: mod.id,
                                sourceUrl: url
                            }
                        },
                        create: {
                            modId: mod.id,
                            sourceUrl: url,
                            query: query,
                        },
                        update: {
                            query: query
                        }
                    });
                });            
            }
        }),
    getAllModsBrowser: publicProcedure
        .input(z.object({
            categories: z.string().nullable(),
            search: z.string().nullable(),
            timeframe: z.number().nullable(),
            sort: z.number().nullable(),

            offset: z.number().nullable(),
            count: z.number().nullable()
        }))
        .query(({ ctx, input }) => {
            const offset = input.offset ?? 0;
            const count = (typeof input.count === 'number' && !isNaN(input.count)) ? input.count : 10;

            // Process categories.
            const catsArr = JSON.parse(input.categories ?? "[]");

            // Construct timeframe.
            let dateAfter: Date | null = null;
            let toSub: number | null = null;

            switch (input.timeframe) {
                case 0:
                    toSub = 3600;

                    break;

                case 1:
                    toSub = 86400;

                    break;

                case 2:
                    toSub = 604800;

                case 3:
                    toSub = 592000;

                    break;

                case 4:
                    toSub = 31536000;

                    break;
            }

            if (toSub)
                dateAfter = new Date((Math.floor(Date.now() / 1000) - toSub) * 1000);

            console.log("Sort is " + input.sort);

            return ctx.prisma.mod.findMany({
                include: {
                    ModSource: true,
                    ModRating: true,
                    category: true
                },
                where: {
                    ...(catsArr && catsArr.length > 0 && { categoryId: {
                            in: catsArr
                        }}),
                        ...(input.search && {
                            OR: {
                                name: {
                                    contains: input.search 
                                },
                                description_short: {
                                    contains: input.search
                                },
                                category: {
                                    name: {
                                        contains: input.search
                                    },
                                    name_short: {
                                        contains: input.search
                                    }
                                }
                            }
                        }),
                },
                ...(input.sort != null && {
                    orderBy: {
                        ...(input.sort == 0 && {
                            ModRating: {
                                _count: "desc"
                            }
                        }),
                        ...(input.sort == 1 && {
                            total_views: "desc"
                        }),
                        ...(input.sort == 2 && {
                            total_downloads: "desc"
                        }),
                        ...(input.sort == 3 && {
                            updateAt: "desc"
                        }),
                        ...(input.sort == 4) && {
                            createAt: "desc"
                        }
                    }
                }),
                skip: offset,
                take: count
            });
        }),
    getAllMods: publicProcedure
        .query(({ ctx }) => {
            return ctx.prisma.mod.findMany();
        })
});
