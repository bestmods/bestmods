import { z } from "zod";
import { router, publicProcedure, contributorProcedure } from "../trpc";

import fs from 'fs';
import FileType from '../../../utils/base64';
import { TRPCError } from "@trpc/server"

export const categoryRouter = router({
    getCategory: publicProcedure
        .input(z.object({
            id: z.number().nullable().default(null),
            url: z.string().nullable().default(null),
            parent: z.number().nullable().default(null),
            parentUrl: z.string().nullable().default(null),

            selId: z.boolean().default(false),
            selParentId: z.boolean().default(false),
            selName: z.boolean().default(false),
            selNameShort: z.boolean().default(false),
            selUrl: z.boolean().default(false),
            selClasses: z.boolean().default(false),
            selIcon: z.boolean().default(false),
            selHasBg: z.boolean().default(false),

            incParent: z.boolean().default(false),
            incChildren: z.boolean().default(false),
            incMods: z.boolean().default(false)
        }))
        .query(({ ctx, input }) => {
            if (input.id == null && input.url == null && input.parent == null)
                return null;

            return ctx.prisma.category.findFirst({
                select: {
                    id: input.selId,
                    parentId: input.selParentId,
                    name: input.selName,
                    nameShort: input.selNameShort,
                    url: input.selUrl,
                    classes: input.selClasses,
                    icon: input.selIcon,
                    hasBg: input.selHasBg,

                    children: input.incChildren,
                    parent: input.incParent,
                    Mod: input.incMods
                },
                where: {
                    ...(input.id != null && {
                        id: input.id
                    }),
                    ...(input.url != null && {
                        url: input.url
                    }),
                    ...(input.parent != null && {
                        parentId: input.parent
                    }),
                    ...(input.parentUrl != null && {
                        parent: {
                            url: input.parentUrl
                        }
                    })
                }
            });
        }),
    addCategory: contributorProcedure
        .input(z.object({
            id: z.number().nullable(),
            parent_id: z.number().nullable(),
            name: z.string(),
            nameShort: z.string(),
            url: z.string(),
            icon: z.string().nullable(),
            classes: z.string().nullable(),

            iremove: z.boolean().nullable(),

            hasBg: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            let cat = null;

            try {
                cat = await ctx.prisma.category.upsert({
                    where: {
                        id: input.id ?? 0
                    },
                    update: {
                        parentId: input.parent_id || null,
                        name: input.name,
                        nameShort: input.nameShort,
                        url: input.url,
                        classes: input.classes ?? null,

                        hasBg: input.hasBg
                    },
                    create: {
                        parentId: input.parent_id || null,
                        name: input.name,
                        nameShort: input.nameShort,
                        url: input.url,
                        classes: input.classes ?? null,

                        hasBg: input.hasBg
                    }
                });
            } catch (error) {
                console.error("Error creating or updating category.");
                console.error(error);

                throw new TRPCError({
                    code: "CONFLICT",
                    message: (typeof error == "string") ? error : ""
                });
            }

            if (cat != null) {
                // Let's now handle file uploads.
                let iconPath = null;

                if (input.icon != null && input.icon.length > 0) {
                    const base64Data = input.icon.split(',')[1];

                    if (base64Data != null) {
                        // Retrieve file type.
                        const fileExt = FileType(base64Data);

                        // Make sure we don't have an unknown file type.
                        if (fileExt != "unknown") {
                            // Now let's compile our file name.
                            const fileName = cat.id + "." + fileExt;

                            // Set icon path.
                            iconPath = "/images/category/" + fileName;

                            // Convert to binary from base64.
                            const buffer = Buffer.from(base64Data, 'base64');

                            // Write file to disk.
                            try {
                                fs.writeFileSync(process.env.UPLOADS_DIR + "/" + iconPath, buffer);
                            } catch (error) {
                                console.error("Error writing icon to disk.");
                                console.error(error);

                                throw new TRPCError({
                                    code: "PARSE_ERROR",
                                    message: (typeof error == "string") ? error : ""
                                });
                            }
                        } else {
                            console.error("Icon's file extension is unknown.");

                            throw new TRPCError({
                                code: "PARSE_ERROR",
                                message: "Icon's file extension is unknown."
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

                // If we have a file upload, update database.
                if (iconPath != null || input.iremove) {
                    // If we're removing the icon or banner, make sure our data is null before updating again.
                    if (input.iremove) {
                        iconPath = null;
                    }

                    try {
                        await ctx.prisma.category.update({
                            where: {
                                id: cat.id
                            },
                            data: {
                                icon: iconPath
                            }
                        })
                    } catch (error) {
                        console.error("Error updating category when adding icon and banner.");
                        console.error(error);

                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Error updating category with icon and banner data. " + error
                        });
                    }
                }
            }
        }),
    delCategory: contributorProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            if (input.id < 1)
                return;

            return await ctx.prisma.category.delete({
                where: {
                    id: input.id
                }
            });
        }),
    getCategoriesMapping: publicProcedure
        .input(z.object({
            selId: z.boolean().default(false),
            selParentId: z.boolean().default(false),
            selName: z.boolean().default(false),
            selNameShort: z.boolean().default(false),
            selUrl: z.boolean().default(false),
            selClasses: z.boolean().default(false),
            selIcon: z.boolean().default(false),
            selHasBg: z.boolean().default(false),

            incParent: z.boolean().default(false),
            incChildren: z.boolean().default(false),
            incMods: z.boolean().default(false),
            incModsCnt: z.boolean().default(false)
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.category.findMany({
                where: {
                    parentId: null
                },
                select: {
                    id: input.selId,
                    parentId: input.selParentId,
                    name: input.selName,
                    nameShort: input.selNameShort,
                    url: input.selUrl,
                    classes: input.selClasses,
                    icon: input.selIcon,
                    hasBg: input.selHasBg,

                    children: input.incChildren,
                    parent: input.incParent,
                    Mod: input.incMods,

                    ...(input.incModsCnt && {
                        _count: {
                            select: {
                                Mod: true
                            }
                        }
                    })
                },
            });
        }),
    getModCnt: publicProcedure
        .input(z.object({
            id: z.number()
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.category.findFirst({
                where: {
                    id: input.id
                },
                select: {
                    _count: {
                        select: {
                            Mod: true
                        }
                    }
                }
            });
        })
});
