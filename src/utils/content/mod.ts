import { type Mod, type ModDownload, type ModInstaller, type ModScreenshot, type ModSource, type PrismaClient } from "@prisma/client";

import FileType from '../base64';
import fs from 'fs';

export const Insert_Or_Update_Mod = async (
    prisma: PrismaClient,

    name?: string,
    url?: string,
    description?: string,
    visible?: boolean,
    
    lookup_id?: number,
    lookup_url?: string,

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
    installers?: ModInstaller[]
): Promise<[Mod | null, boolean, string | null | any]> => {
    // Returns.
    let mod: Mod | null = null;

    // Make sure we have text in required fields.
    if (!lookup_id && !lookup_url && (!url || url.length < 1 || !name || name.length < 1 || !description || description.length < 1)) {
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

    if (banner != null && banner.length > 0 && !bremove) {
        const base64Data = banner.split(',')[1];

        if (base64Data != null) {
            // Retrieve file type.
            const fileExt = FileType(base64Data);

            // Make sure we don't have an-++ unknown file type.
            if (fileExt != "unknown") {
                // Now let's compile our file name.
                const fileName = url + "." + fileExt;

                // Set icon path.
                banner_path = "/images/mod/" + fileName;

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
            return [null, false, "Parsing base64 data is null."];
    }

    try {
        if (lookup_id || lookup_url) {
            mod = await prisma.mod.update({
                where: {
                    ...(lookup_id && {
                        id: lookup_id
                    }),
                    ...(lookup_url && {
                        url: lookup_url
                    })
                },
                data: {
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
                    })
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
                    })
                }
            });
        }
    } catch (error) {
        return [null, false, error];
    }

    if (mod == null)
        return [null, false, "Mod is null."];

    // For now, we want to clear out all relation data to our mod before re-updating with how our form and React setup works.
    try {
        if (downloads){
            await prisma.modDownload.deleteMany({
                where: {
                    modId: mod.id
                }
            });
        }

        if (screenshots) {
            await prisma.modScreenshot.deleteMany({
                where: {
                    modId: mod.id
                }
            });
        }

        if (sources) {
            await prisma.modSource.deleteMany({
                where: {
                    modId: mod.id
                }
            });
        }

        if (installers) {
            await prisma.modInstaller.deleteMany({
                where: {
                    modId: mod.id
                }
            });
        }
    } catch (error) {
        // Log, but continue.
        console.error("Error deleting relations for Mod ID #" + mod.id)
        console.error(error)
    }

    // Loop through downloads.
    if (downloads) {
        downloads.forEach(async ({ name, url }) => {
            if (url.length < 1 || !mod)
                return;

            try {
                await prisma.modDownload.upsert({
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
            } catch (error) {
                console.error("Error inserting download for mod ID #" + mod.id + " (name => " + name + ". URL => " + url);
                console.error(error);
            }
        });
    }

    // Loop through screenshots.
    if (screenshots) {
        screenshots.forEach(async ({ url }) => {
            if (url.length < 1 || !mod)
                return

            try {
                await prisma.modScreenshot.upsert({
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
            } catch (error) {
                console.error("Error inserting screenshot for mod ID #" + mod.id + " (URL => " + url);
                console.error(error);
            }
        });
    }

    // Loop through sources.
    if (sources) {
        sources.forEach(async ({ sourceUrl, query }) => {
            if (sourceUrl.length < 1 || query.length < 1 || !mod)
                return;

            try {
                await prisma.modSource.upsert({
                    where: {
                        modId_sourceUrl: {
                            modId: mod.id,
                            sourceUrl: sourceUrl
                        }
                    },
                    create: {
                        modId: mod.id,
                        sourceUrl: sourceUrl,
                        query: query,
                    },
                    update: {
                        query: query
                    }
                });
            } catch (error) {
                console.error("Error inserting source for mod ID #" + mod.id + " (URL => " + sourceUrl + ". Query => " + query);
                console.error(error);
            }
        });
    }

    // Loop through installers.
    if (installers) {
        installers.forEach(async ({ sourceUrl, url }) => {
            if (sourceUrl.length < 1 || url.length < 1 || !mod)
                return;

            try {
                await prisma.modInstaller.upsert({
                    where: {
                        modId_sourceUrl: {
                            modId: mod.id,
                            sourceUrl: sourceUrl
                        }
                    },
                    create: {
                        modId: mod.id,
                        sourceUrl: sourceUrl,
                        url: url
                    },
                    update: {
                        url: url
                    }
                });
            } catch (error) {
                console.error("Error inserting installer for mod ID #" + mod.id + " (source URL => " + sourceUrl + ". URL => " + url);
                console.error(error);
            }
        });
    }

    return [mod, true, null];
}

export const Delete_Mod = async (
    prisma: PrismaClient,
    id?: number,
    url?: string
): Promise<[boolean, string | any | null]> => {
    if (!id && !url)
        return [false, "ID and URL both not specified!"];

    try {
        await prisma.mod.delete({
            where: {
                ...(id && {
                    id: id
                }),
                ...(url && {
                    url: url
                })
            }
        });
    } catch (error) {
        return [false, error];
    }

    return [true, null];
}