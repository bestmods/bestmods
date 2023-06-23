import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../../server/db/client";
import { Delete_Mod, Insert_Or_Update_Mod } from "../../../utils/content/mod";
import { ModDownload, ModInstaller, ModScreenshot, ModSource } from "@prisma/client";

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

        // Retrieve ID if any.
        const { id } = req.query;
        const preUrl = req.query.url;

        if (!id && (!name || !description || !url)) {
            return res.status(400).json({
                message: "Name, description, or URL not found in POST data for new entry.",
                data: null
            });
        }

        // If we have an ID, try to find it first.
        if (id || preUrl) {
            const mod = await prisma.mod.findFirst({
                where: {
                    ...(id && {
                        id: Number(id.toString())
                    }),
                    ...(preUrl && {
                        url: preUrl.toString()
                    })
                }
            });

            if (!mod) {
                return res.status(404).json({
                    message:"Mod not found. Mod ID =>" + id?.toString() ?? "N/A" + ". URL => " + preUrl?.toString() ?? "N/A"
                });
            }
        }

        // Update mod.
        const [mod, success, err] = await Insert_Or_Update_Mod(prisma, name, url, description, visible, (id) ? Number(id) : undefined, undefined, owner_id, owner_name, banner, bremove, category_id, description_short, install, downloads, screenshots, sources, installers);

        // Check for error.
        if (!success || !mod) {
            return res.status(400).json({
                message: err,
                data: null
            })
        }

        return res.status(200).json({
            message: "Updated mod successfully!",
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