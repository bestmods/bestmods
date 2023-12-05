import { type ModCredit, type Mod, type ModDownload, type ModInstaller, type ModScreenshot, type ModSource, type PrismaClient } from "@prisma/client";

import { UploadFile } from "@utils/fileupload";

export const Insert_Or_Update_Mod = async (
    prisma: PrismaClient,

    name?: string,
    url?: string,
    description?: string,
    visible?: boolean,
    
    lookup_id?: number,

    owner_id?: string,
    owner_name?: string,

    banner?: string,
    bremove?: boolean,
    
    category_id?: number | null,

    description_short?: string,
    install?: string,

    downloads?: ModDownload[],
    screenshots?: ModScreenshot[],
    sources?: ModSource[],
    installers?: ModInstaller[],
    credits?: ModCredit[]
): Promise<[Mod | null, boolean, string | null | unknown]> => {
    // Returns.
    let mod: Mod | null = null;

    // Make sure we have text in required fields.
    if (!lookup_id && (!url || url.length < 1 || !name || name.length < 1 || !description || description.length < 1)) {
        let err = "URL is empty.";

        if (!name || name.length < 1)
            err = "Name is empty.";

        if (!description || description.length < 1)
            err = "Description is empty.";

        return [null, false, err]
    }

    // Let's now handle file uploads.
    let banner_path: string | boolean | null = false;

    if (bremove)
        banner_path = null;

    if (!bremove && (banner && banner.length > 0)) {
        const path = `/images/mod/${url}`

        const [success, err, full_path] = UploadFile(path, banner);

        if (!success || !full_path)
            return [null, false, err];
        
        banner_path = full_path;
    }

    try {
        if (lookup_id) {
            mod = await prisma.mod.update({
                where: {
                    id: lookup_id
                },
                data: {
                    editAt: new Date(Date.now()),
                    ...(visible !== undefined && {
                        visible: visible
                    }),
                    ...(owner_name && owner_name.length > 0 && {
                        ownerName: owner_name
                    }),
                    ...(owner_id && {
                        ownerId: owner_id
                    }),
                    ...(name && {
                        name: name
                    }),
                    ...(url && {
                        url: url
                    }),
                    ...(category_id !== undefined && {
                        categoryId: category_id
                    }),
                    ...(description && {
                        description: description
                    }),
                    ...(description && {
                        descriptionShort: description_short
                    }),
                    ...(install && {
                        install: install
                    }),
                    ...(banner_path !== false && {
                        banner: banner_path
                    }),
                    ModDownload: {
                        deleteMany: {
                            modId: lookup_id
                        },
                        create: downloads?.map((download) => ({
                            name: download.name,
                            url: download.url
                        }))
                    },
                    ModSource: {
                        deleteMany: {
                            modId: lookup_id
                        },
                        create: sources?.map((source) => ({
                            sourceUrl: source.sourceUrl,
                            query: source.query,
                            primary: source.primary
                        }))
                    },
                    ModInstaller: {
                        deleteMany: {
                            modId: lookup_id
                        },
                        create: installers?.map((installer) => ({
                            sourceUrl: installer.sourceUrl,
                            url: installer.url
                        }))
                    },
                    ModScreenshot: {
                        deleteMany: {
                            modId: lookup_id
                        },
                        create: screenshots?.map((screenshot) => ({
                            url: screenshot.url
                        }))
                    },
                    ModCredit: {
                        deleteMany: {
                            modId: lookup_id
                        },
                        create: credits?.map((credit) => ({
                            name: credit.name,
                            credit: credit.credit,
                            userId: credit.userId
                        }))
                    }
                }
            });
        } else {
            mod = await prisma.mod.create({
                data: {
                    visible: visible,
                    ownerName: owner_name,
                    ownerId: owner_id,

                    name: name ?? "",
                    url: url ?? "",
                    categoryId: category_id ?? null,

                    description: description ?? "",
                    descriptionShort: description_short,
                    install: install,

                    ...(banner_path !== false && {
                        banner: banner_path
                    }),
                    ModDownload: {
                        create: downloads?.map((download) => ({
                            name: download.name,
                            url: download.url
                        }))
                    },
                    ModSource: {
                        create: sources?.map((source) => ({
                            sourceUrl: source.sourceUrl,
                            query: source.query,
                            primary: source.primary
                        }))
                    },
                    ModInstaller: {
                        create: installers?.map((installer) => ({
                            sourceUrl: installer.sourceUrl,
                            url: installer.url
                        }))
                    },
                    ModScreenshot: {
                        create: screenshots?.map((screenshot) => ({
                            url: screenshot.url
                        }))
                    },
                    ModCredit: {
                        create: credits?.map((credit) => ({
                            name: credit.name,
                            credit: credit.credit,
                            userId: credit.userId
                        }))
                    }
                }
            });
        }
    } catch (error) {
        return [null, false, error];
    }

    if (mod == null)
        return [null, false, "Mod is null."];

    return [mod, true, null];
}

export const Delete_Mod = async (
    prisma: PrismaClient,
    id?: number,
    url?: string
): Promise<[boolean, string | unknown | null]> => {
    if (!id && !url)
        return [false, "ID and URL both not specified!"];

    try {
        await prisma.mod.delete({
            where: {
                id: id,
                url: url
            }
        });
    } catch (error) {
        return [false, error];
    }

    return [true, null];
}

export const Get_Mod_Rating = async (
    prisma: PrismaClient,
    id: number,
    date?: Date
): Promise<number> => {
    const rating_pos = await prisma.modRating.count({
        where: {
            modId: id,
            positive: true,
            ...(date && {
                createdAt: {
                    gte: date
                }
            })
        }
    });

    const rating_neg = await prisma.modRating.count({
        where: {
            modId: id,
            positive: false,
            ...(date && {
                createdAt: {
                    gte: date
                }
            })
        }
    });

    return (rating_pos - rating_neg) + 1;
}