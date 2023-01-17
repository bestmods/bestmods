import { z } from "zod";
import { router, publicProcedure } from "../trpc";

import fs from 'fs';
import FileType from '../../../utils/base64';
import { TRPCError } from "@trpc/server"

export const categoryRouter = router({
    getCategory: publicProcedure
        .input(z.object({
            id: z.number(),
        }))
        .query(({ ctx, input}) => {
            const cat = ctx.prisma.category.findFirst({
                where: {
                    id: input.id
                }
            });

            return cat;
        }),
    addCategory: publicProcedure
        .input(z.object({
            id: z.number().nullable(),
            parent_id: z.number().nullable(),
            name: z.string(),
            name_short: z.string(),
            url: z.string(),
            icon: z.string().nullable(),
            classes: z.string().nullable(),
            iremove: z.boolean().nullable()
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
                        name_short: input.name_short,
                        url: input.url,
                        classes: input.classes ?? null        
                    },
                    create: {
                        parentId: input.parent_id || null,
                        name: input.name,
                        name_short: input.name_short,
                        url: input.url,
                        classes: input.classes ?? null 
                    }
                });
            } catch (error) {
                console.error("Error creating or updating category.");
                console.error(error);

                throw new TRPCError({ 
                    code: "CONFLICT",
                    message: error
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
                                fs.writeFileSync(process.env.PUBLIC_DIR + "/" + iconPath, buffer);
                            } catch (error) {
                                console.error("Error writing icon to disk.");
                                console.error(error);

                                throw new TRPCError({ 
                                    code: "PARSE_ERROR",
                                    message: error
                                });
                            }
                        } else {
                            console.error("Icon's file extension is unknown.");

                            throw new TRPCError({ 
                                code: "PARSE_ERROR",
                                message: error
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
    getCategoriesByParent: publicProcedure
        .input(z.object({
            parent_id: z.number()
        }))
        .query(({ ctx, input }) => {
            const cats = ctx.prisma.category.findMany({
                where: {
                    parentId: input.parent_id
                }
            });

            return cats;
        }),
    getCategoriesMapping: publicProcedure
        .query(({ ctx }) => {
            // First retrieve all platform categories (parent ID => 0).
            return ctx.prisma.category.findMany({
                where: {
                    parentId: null
                },
                include: {
                    children: true
                }
            });
        }),
    getAllCategories: publicProcedure
        .query(({ ctx }) => {
            return ctx.prisma.category.findMany();
        })
});
