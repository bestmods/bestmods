import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "@server/db/client";

import { DeleteMod, InsertOrUpdateMod } from "@utils/content/mod";

import { type ModCredit, type ModDownload, type ModInstaller, type ModScreenshot, type ModSource } from "@prisma/client";
import { CheckApiAccess } from "@utils/content/api";

export default async function Mod (req: NextApiRequest, res: NextApiResponse) {
    // Retrieve method and check.
    const method = req.method;

    if (!method) {
        return res.status(405).json({
            message: "No method specified."
        });
    }
    
    // Perform API access check.
    const [suc, err] = await CheckApiAccess({
        req: req
    });

    if (!suc) {
        return res.status(400).json({
            message: err
        });
    }

    // If this is a GET request, we are retrieving an item.
    if (method == "GET") {
        // Retrieve where clauses.
        const { id, visible, needsRecounting } = req.query;

        // Limit.
        const limit = Number(req.query?.limit?.toString() ?? 10);

        // Sorting.
        const sort = Number(req.query?.sort?.toString() ?? 0);
        const sortInvert = Boolean(req.query?.sortInvert?.toString() ?? false);

        const sortDir = sortInvert ? "asc" : "desc";

        // Retrieve category and check.
        const mods = await prisma.mod.findMany({
            include: {
                owner: true,
                category: true,

                ModSource: true,
                ModInstaller: true,
                ModDownload: true,
                ModScreenshot: true,
                ModCredit: true,
                ModCollections: true
            },
            where: {
                ...(id && {
                    id: Number(id.toString())
                }),
                ...(visible && {
                    visible: Boolean(visible?.toString())
                }),
                ...(needsRecounting && {})
            },
            take: limit,
            orderBy: {
                ...(sort == 0 && {
                    createAt: sortDir
                }),
                ...(sort == 1 && {
                    updateAt: sortDir
                }),
                ...(sort == 2 && {
                    editAt: sortDir
                }),
                ...(sort == 3 && {
                    recountedAt: sortDir
                }),
                ...(sort == 4 && {
                    lastScanned: sortDir
                })
            }
        });

        // Return mod.
        return res.status(200).json({
            "message": `${mods.length.toString()} mods fetched!`,
            data: {
                mods: JSON.parse(JSON.stringify(mods, (_, v) => typeof v === "bigint" ? v.toString() : v))
            }
        });
    } else if (["POST", "PATCH", "PUT"].includes(method)) {
        const update = ["PATCH", "PUT"].includes(method);

        // Retrieve POST data.
        const { 
            url,
            visible,
            ownerId,
            ownerName,
            name,
            banner,
            bremove,
            description,
            descriptionShort,
            install,
            categoryId,
            downloads,
            screenshots,
            sources,
            installers,
            credits,
            lastScanned
        } : {
            url?: string,
            visible?: boolean,
            ownerId?: string,
            ownerName?: string,
            name?: string,
            banner?: string,
            bremove?: boolean
            description?: string,
            descriptionShort?: string,
            install?: string,
            categoryId?: number | null,
            downloads?: ModDownload[]
            screenshots?: ModScreenshot[],
            sources?: ModSource[],
            installers?: ModInstaller[],
            credits?: ModCredit[]
            lastScanned?: Date | string
        } = req.body;

        let id: string | undefined = undefined;

        // If we have an ID, try to find it first.
        if (update) {
            // Retrieve ID and check.
            id = req.query.id?.toString();

            if (!id) {
                return res.status(400).json({
                    message: "Cannot update mod. Missing ID."
                });
            }

            const mod = await prisma.mod.findFirst({
                where: {
                    id: Number(id)
                }
            });

            if (!mod) {
                return res.status(404).json({
                    message: `Mod not found. Mod ID => ${id?.toString() ?? "N/A"}`
                });
            }
        } else {
            // Make sure specified fields are filled first.
            if (!name || !description || !url) {
                return res.status(400).json({
                    message: "Name, description, or URL not found in POST data for new entry.",
                    data: null
                });
            }
        }

        // Update or insert mod.
        const [mod, success, err] = await InsertOrUpdateMod ({
            prisma: prisma,

            lookupId: (update) ? Number(id) : undefined,

            ownerId: ownerId,
            ownerName: ownerName,

            categoryId: categoryId,

            name: name,
            url: url,
            description: description,
            descriptionShort: descriptionShort,
            install: install,
            visible: visible,

            banner: banner,
            bremove: bremove,

            lastScanned: lastScanned ? new Date(lastScanned) : undefined,

            downloads: downloads,
            screenshots: screenshots,
            sources: sources,
            installers: installers,
            credits: credits
        })
        
        // Check for error.
        if (!success || !mod) {
            return res.status(400).json({
                message: `Unable to ${update ? "update" : "insert"} mod. Error => ${err}`,
                data: null
            });
        }

        return res.status(200).json({
            message: `${update ? "Inserted" : "Updated"} mod successfully!`,
            data: {
                mod: JSON.parse(JSON.stringify(mod, (_, v) => typeof v === "bigint" ? v.toString() : v))
            }
        });
    } else if (method == "DELETE") {
        const { id } = req.query;

        if (!id) {
            return res.status(404).json({
                message: "Mod ID not present."
            });
        }

        // Check if exists.
        const mod = await prisma.mod.findFirst({
            where: {
                id: Number(id.toString())
            }
        });

        if (!mod) {
            return res.status(400).json({
                message: `Mod not found. ID => ${id.toString()}`
            });
        }

        const [success, err] = await DeleteMod ({
            prisma: prisma,
            id: mod.id

        });

        if (!success) {
            return res.status(400).json({
                message: err
            });
        }

        return res.status(200).json({
            message: "Mod deleted!"
        });
    }

    return res.status(405).json({
        message: "Method not allowed."
    });
}