import { type S3 } from "@aws-sdk/client-s3";
import { type Category, type PrismaClient } from "@prisma/client";

import { UploadFile } from "@utils/file_upload";

export async function InsertOrUpdateCategory ({
    prisma,
    s3,

    lookupId,

    parentId,

    name,
    nameShort,
    description,
    url,
    classes,
    hasBg,

    icon,
    banner,

    iremove,
    bremove
} : {
    prisma: PrismaClient
    s3?: S3

    lookupId?: number

    parentId?: number | null

    name?: string
    nameShort?: string
    description?: string | null
    url?: string
    classes?: string | null
    hasBg?: boolean

    icon?: string
    banner?: string

    iremove?: boolean
    bremove?: boolean
}): Promise<[Category | null, boolean, string | null | unknown]> {
    // Returns.
    let cat: Category | null = null;

    // We must insert/update our category first.
    try {
        if (lookupId) {
            cat = await prisma.category.update({
                where: {
                    id: lookupId
                },
                data: {
                    ...(parentId != undefined && {
                        parentId: parentId || null
                    }),
                    description: description,
                    name: name,
                    nameShort: nameShort,
                    url: url,
                    classes: classes,
                    hasBg: hasBg
                }
            });
        } else {
            // Check to make sure certain fields are defined.
            if (!url)
                return [null, false, "URL is empty."];

            if (!name)
                return [null, false, "Name is empty."];

            if (!nameShort)
                return [null, false, "Short name is empty."];

            cat = await prisma.category.create({
                data: {
                    parentId: parentId || null,
                    description: description,
                    name: name,
                    nameShort: nameShort,
                    url: url,
                    classes: classes,
                    hasBg: hasBg
                }
            });
        }
    } catch (error) {
        return [cat, false, error];
    }

    if (!cat) {
        return [cat, false, "Category is null."];
    }

    // Let's now handle file uploads.
    let icon_path: string | boolean | null = false;

    if (iremove)
        icon_path = null;

    if (!iremove && (icon && icon.length > 0)) {
        const path = `images/category/icon/${cat.id.toString()}`;

        const [success, err, fullPath] = await UploadFile({
            s3: s3,
            path: path,
            contents: icon
        });

        if (!success || !fullPath)
            return [null, false, err];

        icon_path = fullPath;
    }

    let banner_path: string | boolean | null = false;

    if (bremove)
        banner_path = null;

    if (!bremove && (banner && banner.length > 0)) {
        const path = `images/category/banner/${cat.id.toString()}`;

        const [success, err, fullPath] = await UploadFile({
            s3: s3,
            path: path,
            contents: banner
        });

        if (!success || !fullPath)
            return [null, false, err];

        banner_path = fullPath;
    }

    // If we have a file upload, update database.
    if (icon_path !== false || banner_path !== false) {
        try {
            await prisma.category.update({
                where: {
                    id: cat.id
                },
                data: {
                    ...(icon_path !== false && {
                        icon: icon_path
                    }),
                    ...(banner_path !== false && {
                        banner: banner_path
                    })
                }
            })
        } catch (error) {
            return [cat, false, error];
        }
    }
   
    return [cat, true, null];
}

export async function DeleteCategory ({
    prisma,
    id
} : {
    prisma: PrismaClient,
    id: number
}): Promise<[boolean, string | unknown | null]> {
    try {
        await prisma.category.delete({
            where: {
                id: id
            }
        });
    } catch (error) {
        return [false, error];
    }

    return [true, null];
}