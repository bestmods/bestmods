import { Mod } from "@prisma/client";

import FileType from '../base64';
import fs from 'fs';

type downloads = {
    name: string,
    url: string
};

type screenshots = {
    url: string
};

type sources = {
    url: string
    query: string
};

type installers = {
    src_url: string
    url: string
};

export const Insert_Or_Update_Mod = async (
    prisma: any,

    name: string,
    url: string,
    description: string,
    
    lookup_id?: number,
    lookup_url?: string,

    owner_id?: string,
    owner_name?: string,

    banner?: string,
    bremove?: boolean,
    
    category_id?: number,

    description_short?: string,
    install?: string,

    downloads?: downloads[],
    screenshots?: screenshots[],
    sources?: sources[],
    installers?: installers[]
): Promise<[Mod | null, boolean, string | null | any]> => {
    // Returns.
    let mod: Mod | null = null;
    let success: boolean = true;
    let err: string | null | any = null;

    // Make sure we have text in required fields.
    if (url.length < 1 || name.length < 1 || description.length < 1) {
        err = "URL is empty.";
        success = false;

        if (name.length < 1)
            err = "Name is empty.";

        if (description.length < 1)
            err = "Description is empty.";

        return [mod, success, err]
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
                    err = "Error writing banner to disk."
                    success = false;

                    return [mod, success, err];
                }
            } else {
                err = "Banner's file extension is unknown.";
                success = false;

                return [mod, success, err];
            }
        } else {
            err = "Parsing base64 data is null.";
            success = false;

            return [mod, success, err];
        }
    }

    try {
        mod = await prisma.mod.upsert({
            where: {
                ...(lookup_id && {
                    id: lookup_id
                }),
                ...(lookup_url && {
                    url: lookup_url
                })
            },
            update: {
                ...(owner_name && owner_name.length > 0 && {
                    ownerName: owner_name
                }),
                ...(owner_id && {
                    ownerId: owner_id
                }),

                name: name,
                url: url,
                categoryId: category_id ?? null,

                description: description,
                descriptionShort: description_short,
                install: install,

                ...(banner_path !== false && {
                    banner: banner_path
                })
            },
            create: {
                ...(owner_name && owner_name.length > 0 && {
                    ownerName: owner_name
                }),
                ...(owner_id && {
                    ownerId: owner_id
                }),

                name: name,
                url: url,
                categoryId: category_id ?? null,

                description: description,
                descriptionShort: description_short,
                install: install,

                ...(banner_path !== false && {
                    banner: banner_path
                })
            }
        });
    } catch (error) {
        err = error;
        success = false;

        return [mod, success, err];
    }

    if (mod == null) {
        err = "Mod is null.";
        success = false;

        return [mod, success, err];
    }

    // For now, we want to clear out all relation data to our mod before re-updating with how our form and React setup works.
    try {
        await prisma.modDownload.deleteMany({
            where: {
                modId: mod.id
            }
        });

        await prisma.modScreenshot.deleteMany({
            where: {
                modId: mod.id
            }
        });

        await prisma.modSource.deleteMany({
            where: {
                modId: mod.id
            }
        });

        await prisma.modInstaller.deleteMany({
            where: {
                modId: mod.id
            }
        });
    } catch (error) {
        // Log, but continue.
        console.error("Error deleting relations for Mod ID #" + mod.id)
        console.error(error)
    }

    // Loop through downloads.
    if (downloads) {
        downloads.forEach(async ({ name, url }: { name: string, url: string }) => {
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
        screenshots.forEach(async ({ url }: { url: string }) => {
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
        sources.forEach(async ({ url, query }: { url: string, query: string }) => {
            if (url.length < 1 || query.length < 1 || !mod)
                return;

            try {
                await prisma.modSource.upsert({
                    where: {
                        modId_sourceUrl: {
                            modId: mod.id,
                            sourceUrl: url
                        }
                    },
                    create: {
                        modId: mod.id,
                        sourceUrl: url,
                        query: query,
                    },
                    update: {
                        query: query
                    }
                });
            } catch (error) {
                console.error("Error inserting source for mod ID #" + mod.id + " (URL => " + url + ". Query => " + query);
                console.error(error);
            }
        });
    }

    // Loop through installers.
    if (installers) {
        installers.forEach(async ({ src_url, url }: { src_url: string, url: string }) => {
            if (src_url.length < 1 || url.length < 1 || !mod)
                return;

            try {
                await prisma.modInstaller.upsert({
                    where: {
                        modId_sourceUrl: {
                            modId: mod.id,
                            sourceUrl: src_url
                        }
                    },
                    create: {
                        modId: mod.id,
                        sourceUrl: src_url,
                        url: url
                    },
                    update: {
                        url: url
                    }
                });
            } catch (error) {
                console.error("Error inserting installer for mod ID #" + mod.id + " (source URL => " + src_url + ". URL => " + url);
                console.error(error);
            }
        });
    }

    return [mod, success, err];
}