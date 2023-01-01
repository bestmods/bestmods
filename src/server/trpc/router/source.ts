import { z } from "zod";

import fs from 'fs';

import { router, publicProcedure } from "../trpc";
import FileType from '../../../utils/base64';

export const sourceRouter = router({
    getSource: publicProcedure.input(z.object({
        id: z.number().nullable(),
        url: z.string().nullable(),
    })).query(({ ctx, input}) => {
        let src = null;

        // Check URL first and then ID.
        if (input.url != null) {
            src = ctx.prisma.source.findFirst({
                where: {
                    url: input.url
                }
            })
        } else if (input.id != null) {
            src = ctx.prisma.source.findFirst({
                where: {
                    id: input.id
                }
            })
        }

        return src;
    }),
    addSource: publicProcedure
        .input(
        z.object({
            name: z.string(),
            url: z.string(),
            icon: z.string().nullable(),
            banner: z.string().nullable(),
            classes: z.string().nullable(),
            iremove: z.number(),
            bremove: z.number()
        })
        )
        .mutation(async ({ ctx, input }) => {
            let src = null;

            try {
                src = await ctx.prisma.source.create({
                    data: {
                        name: input.name,
                        url: input.url,
                        classes: input.classes ?? null,
                    }
                });
            } catch (error) {
                console.error("Error creating source.");
                console.error(error);

                // Ensure source is null.
                src = null;
            }

            if (src != null) {
                // Let's now handle file uploads.

                let iconPath = null;
                let bannerPath = null;

                if (input.icon != null && input.icon.length > 0) {
                    const base64Data = input.icon.split(',')[1];

                    if (base64Data != null) {
                        // Retrieve file type.
                        const fileExt = FileType(base64Data);

                        // Make sure we don't have an unknown file type.
                        if (fileExt != "unknown") {
                            // Now let's compile our file name.
                            const fileName = src.id + "." + fileExt;

                            // Set icon path.
                            iconPath = "images/source/" + fileName;

                            // Convert to binary from base64.
                            const buffer = Buffer.from(base64Data, 'base64');

                            // Write file to disk.
                            try {
                                fs.writeFileSync("../../../../public/" + iconPath, buffer);
                            } catch (error) {
                                console.error("Error writing icon to disk.");
                                console.error(error);
                            }
                        } else {
                            console.error("Icon's file extension is unknown.");
                        }
                    } else {
                        console.error("Parsing base64 data is null.");
                    }
                }

                if (input.banner != null && input.banner.length > 0) {
                    const base64Data = input.banner.split(',')[1];

                    if (base64Data != null) {
                        // Retrieve file type.
                        const fileExt = FileType(base64Data);

                        // Make sure we don't have an unknown file type.
                        if (fileExt != "unknown") {
                            // Now let's compile our file name.
                            const fileName = src.id + "_banner." + fileExt;

                            // Set banner path.
                            bannerPath = "images/source/" + fileName;

                            // Convert to binary from base64.
                            const buffer = Buffer.from(base64Data, 'base64');

                            // Write file to disk.
                            try {
                                fs.writeFileSync("../../../../public/" + bannerPath, buffer);
                            } catch (error) {
                                console.error("Error writing banner to disk.");
                                console.error(error);
                            }
                        } else {
                            console.error("Banner's file extension is unknown.");
                        }
                    } else {
                        console.error("Parsing base64 data is null.");
                    }
                }

                // If we have a file upload, update database.
                if (iconPath != null || bannerPath != null) { 
                    try {
                        await ctx.prisma.source.update({
                            where: {
                                id: src.id
                            },
                            data: {
                                icon: iconPath,
                                banner: bannerPath
                            }
                        })
                    } catch (error) {
                        console.error("Error updating source when adding icon and banner.");
                        console.error(error);
                    }
                }
            }
        }),
    getAllSources: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.source.findMany();
    })
});
