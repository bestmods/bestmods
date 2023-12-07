import { type PrismaClient, type Source } from "@prisma/client";
import { UploadFile } from "@utils/file_upload";

export async function InsertOrUpdateSource ({
    prisma,

    url,

    update,

    name,
    description,
    classes,

    icon,
    banner,

    iremove,
    bremove,
} : {
    prisma: PrismaClient,

    url: string,
    
    update?: boolean,

    icon?: string,
    iremove?: boolean,

    banner?: string,
    bremove?: boolean,
    
    name?: string,
    description?: string,
    classes?: string | null
}): Promise<[Source | null, boolean, string | null | unknown]> {
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

    if (!iremove && (icon && icon.length > 0)) {
        const path = `/images/source/${url}`;

        const [success, err, fullPath] = UploadFile(path, icon);

        if (!success || !fullPath)
            return [null, false, err];

        icon_path = fullPath;
    }

    if (!bremove && (banner && banner.length > 0)) {
        const path = `/images/source/${url}_banner`;

        const [success, err, fullPath] = UploadFile(path, banner);

        if (!success || !fullPath)
            return [null, false, err];

        banner_path = fullPath;
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
                    ...(description != undefined && {
                        description: description
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
            if (!name)
                return [null, false, "Name is empty on creation."];
            
            src = await prisma.source.create({
                data: {
                    name: name,
                    description: description ?? null,
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

export async function DeleteSource ({
    prisma,
    url
} : {
    prisma: PrismaClient
    url: string
}): Promise<[boolean, string | unknown | null]> {
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