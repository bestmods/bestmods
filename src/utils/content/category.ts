import { type Category, type PrismaClient } from "@prisma/client";

import { UploadFile } from "@utils/file_upload";

export async function InsertOrUpdateCategory ({
    prisma,

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

    lookupId?: number

    parentId?: number | null

    name?: string
    nameShort?: string
    description?: string
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

    // Make sure we have text in required fields.
    if (!lookupId && (!name || name.length < 1 || !nameShort || nameShort.length < 1 || !url || url.length < 1)) {
        let err = "URL is empty.";

        if (!name || name.length < 1)
            err = "Name is empty.";

        if (!nameShort || nameShort.length < 1)
            err = "Short name is empty.";

        return [cat, false, err]
    }

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
            cat = await prisma.category.create({
                data: {
                    parentId: parentId || null,
                    description: description || null,
                    name: name ?? "",
                    nameShort: nameShort ?? "",
                    url: url ?? "",
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
        const path = `/images/category/${cat.id.toString()}`;

        const [success, err, full_path] = UploadFile(path, icon);

        if (!success || !full_path)
            return [null, false, err];

        icon_path = full_path;
    }

    let banner_path: string | boolean | null = false;

    if (bremove)
    banner_path = null;

    if (!bremove && (banner && banner.length > 0)) {
        const path = `/images/category/${cat.id.toString()}_banner`;

        const [success, err, full_path] = UploadFile(path, banner);

        if (!success || !full_path)
            return [null, false, err];

            banner_path = full_path;
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