import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../../server/db/client";

const mod = async (req: NextApiRequest, res: NextApiResponse) => {
    // Check API key.
    const authHeaderVal = req.headers.authorization ?? "";
    const authKey = "Bearer " + process.env.API_AUTH_KEY;

    if (authHeaderVal != authKey) {
        return res.status(401).json({ 
            message: "Unauthorized.",
            data: null
        });
    }

    // If this is a GET request, we are retrieving an item.
    if (req.method == "GET") {
        // Retrieve ID and check.
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                message: "No ID present.",
                data: null
            });
        }

        // Retrieve category and check.
        const mod = await prisma.mod.findFirst({
            include: {
                owner: true,
                category: true
            },
            where: {
                id: Number(id)
            }
        });

        if (!mod) {
            return res.status(404).json({
                message: "Mod ID " + id + " not found.",
                data: null
            });
        }

        // Return mod.
        return res.status(200).json({
            "message": "Mod fetched!",
            data: {
                mod: JSON.parse(JSON.stringify(mod, (_, v) => typeof v === 'bigint' ? v.toString() : v))
            }
        });
    } else if (req.method == "POST") {
        // Retrieve POST data.
        const { url, visible, owner_id, owner_name, name, banner, description, description_short, install, category_id, downloads, screenshots, sources, installers } = req.body;

        // Retrieve ID if any.
        const { id } = req.query;

        if (!id && (!name || !description || !url)) {
            return res.status(400).json({
                message: "Name, description, or URL not found in POST data for new entry.",
                data: null
            });
        }

        if (id) {
            const mod = await prisma.mod.update({
                where: {
                    id: id ? Number(id) : 0
                },
                data: {
                    ...(url && {
                        url: url
                    }),
                    ...(visible && {
                        visible: Boolean(visible)
                    }),
                    ...(owner_id && {
                        ownerId: owner_id
                    }),
                    ...(owner_name && {
                        ownerName: owner_name
                    }),
                    ...(name && {
                        name: name
                    }),
                    ...(description && {
                        description: description
                    }),
                    ...(description_short && {
                        descriptionShort: description_short,
                    }),
                    ...(install && {
                        install: install
                    }),
                    ...(category_id && {
                        categoryId: Number(category_id)
                    })
                }
            });

            if (!mod) {
                return res.status(400).json({
                    message: "Did not update mod successfully.",
                    data: null
                });
            }

            // Insert downloads.
            if (downloads) {
                downloads.forEach(async ({ name, url }: { name: string, url: string }) => {
                    if (url.length < 1)
                        return;

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
                });
            }

            // Insert screenshots.
            if (screenshots) {
                // Loop through screenshots.
                screenshots.forEach(async ({ url }: { url: string }) => {
                    if (url.length < 1)
                        return

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
                });
            }

            // Insert sources.
            if (sources) {
                sources.forEach(async ({ url, query }: { url: string, query: string }) => {
                    if (url.length < 1 || query.length < 1)
                        return;

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
                });
            }

            // Insert installers.
            if (installers) {
                installers.forEach(async ({ src_url, url }: { src_url: string, url: string }) => {
                    if (src_url.length < 1 || url.length < 1)
                        return;

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
                });
            }

            return res.status(200).json({
                message: "Updated mod successfully!",
                data: {
                    mod: JSON.parse(JSON.stringify(mod, (_, v) => typeof v === 'bigint' ? v.toString() : v))
                }
            });
        } else {
            const mod = await prisma.mod.create({
                data: {
                    url: url,
                    visible: visible,
                    ownerId: (owner_id) ? owner_id : null,
                    ownerName: owner_name,
                    name: name,
                    description: description,
                    descriptionShort: description_short,
                    install: install,
                    categoryId: (category_id) ? Number(category_id) : null
                },
            });

            if (!mod) {
                return res.status(400).json({
                    message: "Did not create mod successfully.",
                    data: null
                });
            }

            return res.status(200).json({
                message: "Created mod successfully!",
                data: {
                    mod: JSON.parse(JSON.stringify(mod, (_, v) => typeof v === 'bigint' ? v.toString() : v))
                }
            });
        }
    }

    return res.status(405).json({
        message: "Method not allowed."
    });
};

export default mod;