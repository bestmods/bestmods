import { type Category, type PrismaClient } from "@prisma/client";

import { UploadFile } from "@utils/fileupload";

export const Insert_Or_Update_Category = async (
    prisma: PrismaClient,

    name?: string,
    name_short?: string,
    description?: string,
    url?: string,
    
    lookup_id?: number,

    icon?: string,
    banner?: string,

    iremove?: boolean,
    bremove?: boolean,

    parent_id?: number | null,
    classes?: string | null,
    has_bg?: boolean
): Promise<[Category | null, boolean, string | null | unknown]> => {
    // Returns.
    let cat: Category | null = null;

    // Make sure we have text in required fields.
    if (!lookup_id && (!name || name.length < 1 || !name_short || name_short.length < 1 || !url || url.length < 1)) {
        let err = "URL is empty.";

        if (!name || name.length < 1)
            err = "Name is empty.";

        if (!name_short || name_short.length < 1)
            err = "Short name is empty.";

        return [cat, false, err]
    }

    // We must insert/update our category first.
    try {
        if (lookup_id) {
            cat = await prisma.category.update({
                where: {
                    id: lookup_id
                },
                data: {
                    ...(parent_id != undefined && {
                        parentId: (parent_id > 0) ? parent_id : null
                    }),
                    ...(description != undefined && {
                        description: description
                    }),
                    ...(name && {
                        name: name
                    }),
                    ...(name_short && {
                        nameShort: name_short
                    }),
                    ...(url && {
                        url: url
                    }),
                    ...(classes && {
                        classes: classes ?? null,
                    }),
                    ...(has_bg && {
                        hasBg: has_bg
                    })
                }
            });
        } else {
            cat = await prisma.category.create({
                data: {
                    parentId: parent_id ?? null,
                    description: description ?? null,
                    name: name ?? "",
                    nameShort: name_short ?? "",
                    url: url ?? "",
                    ...(classes && {
                        classes: classes
                    }),
                    ...(has_bg && {
                        hasBg: has_bg
                    })
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

export const Delete_Category = async (
    prisma: PrismaClient,
    id: number
): Promise<[boolean, string | unknown | null]> => {
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