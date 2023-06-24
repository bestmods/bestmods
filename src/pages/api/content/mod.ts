import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../../server/db/client";
import { Delete_Mod, Insert_Or_Update_Mod } from "../../../utils/content/mod";
import { type ModDownload, type ModInstaller, type ModScreenshot, type ModSource } from "@prisma/client";

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
    } else if (["POST", "PATCH", "PUT"].includes(req.method ?? "")) {
        const update = ["PATCH", "PUT"].includes(req.method ?? "");

        // Retrieve POST data.
        const { 
            url,
            visible,
            owner_id,
            owner_name,
            name,
            banner,
            bremove,
            description,
            description_short,
            install,
            category_id,
            downloads,
            screenshots,
            sources,
            installers
        } : {
            url?: string,
            visible?: boolean,
            owner_id?: string,
            owner_name?: string,
            name?: string,
            banner?: string,
            bremove?: boolean
            description?: string,
            description_short?: string,
            install?: string,
            category_id?: number | null,
            downloads?: ModDownload[]
            screenshots?: ModScreenshot[],
            sources?: ModSource[],
            installers?: ModInstaller[]
        } = req.body;

        let id: string | undefined = undefined;
        let pre_url: string | undefined = undefined;

        if (update) {
            // Retrieve ID and pre URL if any.
            id = req.query.id?.toString();
            pre_url = req.query.url?.toString();

            if (!id && !pre_url) {
                return res.status(400).json({
                    message: "Cannot update mod. Missing both ID and URL parameters. Please use one."
                });
            }
        }

        if (!update && (!name || !description || !url)) {
            return res.status(400).json({
                message: "Name, description, or URL not found in POST data for new entry.",
                data: null
            });
        }

        // If we have an ID, try to find it first.
        if (update) {
            const mod = await prisma.mod.findFirst({
                where: {
                    ...(id && {
                        id: Number(id)
                    }),
                    ...(pre_url && {
                        url: pre_url
                    })
                }
            });

            if (!mod) {
                return res.status(404).json({
                    message:"Mod not found. Mod ID =>" + id ?? "N/A" + ". URL => " + pre_url ?? "N/A"
                });
            }
        }

        // Update or insert mod.
        const [mod, success, err] = await Insert_Or_Update_Mod(prisma, name, url, description, visible, (update) ? Number(id) : undefined, (update) ? pre_url : undefined, owner_id, owner_name, banner, bremove, category_id, description_short, install, downloads, screenshots, sources, installers);

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
                mod: JSON.parse(JSON.stringify(mod, (_, v) => typeof v === 'bigint' ? v.toString() : v))
            }
        });
    } else if (req.method == "DELETE") {
        const { id, url } = req.query;

        if (!id && !url) {
            return res.status(404).json({
                message: "Mod ID and URL both not present."
            });
        }

        // Check if exists.
        const mod = await prisma.mod.findFirst({
            where: {
                ...(id && {
                    id: Number(id.toString())
                }),
                ...(url && {
                    url: url.toString()
                })
            }
        });

        if (!mod) {
            return res.status(400).json({
                message: "Mod not found. ID => " + id?.toString() ?? "N/A" + ". URL => " + url?.toString() ?? "N/A" + "."
            });
        }

        const [success, err] = await Delete_Mod(prisma, (id) ? Number(id.toString()) : undefined, (url) ? url.toString() : undefined);

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
};

export default mod;