import { PrismaClient, Source } from "@prisma/client";

import FileType from '../base64';
import fs from 'fs';

export const Insert_Or_Update_Source = async (
    prisma: PrismaClient,

    url: string,
    
    update?: boolean,

    icon?: string,
    iremove?: boolean,

    banner?: string,
    bremove?: boolean,
    
    name?: string,
    classes?: string | null
): Promise<[Source | null, boolean, string | null | any]> => {
    // Returns.
    let src: Source | null = null;

    // Make sure we have text in required fields.
    if (!url || url.length < 2)
        return [null, false, "URL is empty or far too short."]

    let icon_path: string | boolean | null = false;
    let banner_path: string | boolean | null = false;

    if (iremove)
        icon_path = null;

    if (bremove)
        banner_path = null;

    if (icon != null && icon.length > 0 && !iremove) {
        const base64Data = icon.split(',')[1];

        if (base64Data != null) {
            // Retrieve file type.
            const fileExt = FileType(base64Data);

            // Make sure we don't have an unknown file type.
            if (fileExt != "unknown") {
                // Now let's compile our file name.
                const fileName = url + "." + fileExt;

                // Set icon path.
                icon_path = "/images/source/" + fileName;

                // Convert to binary from base64.
                const buffer = Buffer.from(base64Data, 'base64');

                // Write file to disk.
                try {
                    fs.writeFileSync(process.env.UPLOADS_DIR + "/" + icon_path, buffer);
                } catch (error) {
                    return [null, false, error];
                }
            } else
                return [null, false, "Icon's file extension is unknown."];
        } else
            return [null, false, "Parsing base64 data is null."];
    }

    if (banner != null && banner.length > 0 && !bremove) {
        const base64Data = banner.split(',')[1];

        if (base64Data != null) {
            // Retrieve file type.
            const fileExt = FileType(base64Data);

            // Make sure we don't have an unknown file type.
            if (fileExt != "unknown") {
                // Now let's compile our file name.
                const fileName = url + "_banner." + fileExt;

                // Set banner path.
                banner_path = "/images/source/" + fileName;

                // Convert to binary from base64.
                const buffer = Buffer.from(base64Data, 'base64');

                // Write file to disk.
                try {
                    fs.writeFileSync(process.env.UPLOADS_DIR + "/" + banner_path, buffer);
                } catch (error) {
                    return [null, false, error];
                }
            } else
                return [null, false, "Banner's file extension is unknown."];
        } else
            return [src, false, "Parsing base64 data is null."];
    }

    try {
        if (update) {
            src = await prisma.source.update({
                where: {
                    url: url
                },
                data: {
                    ...(name && {
                        name: name
                    }),
                    url: url,
                    ...(classes != undefined && {
                        classes: classes
                    }),
                    ...(icon_path !== false && {
                        icon: icon_path
                    }),
                    ...(banner_path !== false && {
                        banner: banner_path
                    })
                }
            });
        } else {
            src = await prisma.source.create({
                data: {
                    name: name,
                    url: url,
                    classes: classes ?? null,
    
                    ...(icon_path !== false && {
                        icon: icon_path
                    }),
                    ...(banner_path !== false && {
                        banner: banner_path
                    })
                }
            });
        }
    } catch (error) {
        return [src, false, error];
    }
   
    return [src, true, null];
}

export const Delete_Source = async (
    prisma: PrismaClient,
    url: string
): Promise<[boolean, string | any | null]> => {
    try {
        await prisma.source.delete({
            where: {
                url: url
            }
        });
    } catch (error) {
        return [false, error];
    }

    return [true, null];
}