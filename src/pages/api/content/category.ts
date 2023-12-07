import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "@server/db/client";

import { DeleteCategory, InsertOrUpdateCategory } from "@utils/content/category";

const category = async (req: NextApiRequest, res: NextApiResponse) => {
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
        const cat = await prisma.category.findFirst({
            include: {
                parent: true
            },
            where: {
                id: Number(id)
            }
        });

        if (!cat) {
            return res.status(404).json({
                message: "Category ID " + id + " not found.",
                data: null
            });
        }

        // Return category.
        return res.status(200).json({
            "message": "Category fetched!",
            data: {
                category: cat
            }
        });
    } else if (["POST", "PATCH", "PUT"].includes(req.method ?? "")) {
        // Check if this should be an update.
        const update = ["PATCH", "PUT"].includes(req.method ?? "");

        // Retrieve body data.
        const {
            parentId,
            name,
            nameShort,
            description,
            url,
            classes,
            icon,
            banner,
            iremove,
            bremove,
            hasBg 
        } : { 
            parentId?: number
            name?: string
            nameShort?: string
            description?: string
            url?: string
            classes?: string
            icon?: string
            banner?: string
            iremove?: boolean
            bremove?: boolean
            hasBg?: boolean
        } = req.body;

        let id: string | undefined = undefined;

        if (update)
            id = req.query.id?.toString();

        if (update && !id) {
            return res.status(400).json({
                message: "Cannot update category. Missing ID query parameter."
            })
        }

        // If we're not updating, make sure we have a name and name short.
        if (!update && (!name || !nameShort)) {
            return res.status(400).json({
                message: "Name or short name not found in POST data for new entry.",
                data: null
            });
        }

        // If the ID is specified, do a lookup here.
        if (update) {
            const cat = await prisma.category.findFirst({
                where: {
                    id: Number(id)
                }
            });

            if (!cat) {
                return res.status(404).json({
                    message: "Couldn't retrieve category (ID " + id + "). Category not found.",
                    data: null
                });
            }
        }

        const [cat, success, err] = await InsertOrUpdateCategory ({
            prisma: prisma,

            lookupId: (update && id) ? Number (id) : undefined,

            parentId: parentId,

            name: name,
            nameShort: nameShort,
            description: description,
            url: url,
            classes: classes,
            hasBg: hasBg,

            icon: icon,
            banner: banner,

            iremove: iremove,
            bremove: bremove
        });
        
        if (!success || !cat) {
            return res.status(400).json({
                message: `Unable to ${update ? "update" : "insert"} category. Error => ${err}`,
                data: null
            });
        }

        return res.status(200).json({
            message: `${update ? "Updated" : "Inserted"} category successfully!`,
            data: {
                category: cat
            }
        })
    } else if (req.method == "DELETE") {
        const { id } = req.query;

        if (!id) {
            return res.status(404).json({
                message: "Category ID not present."
            });
        }

        // Check if exists.
        const cat = await prisma.category.findFirst({
            where: {
                id: Number(id.toString())
            }
        });

        if (!cat) {
            return res.status(400).json({
                message: "Category ID " + id.toString() + " not found."
            });
        }

        const [success, err] = await DeleteCategory ({
            prisma: prisma,
            id: Number(id.toString())
        });

        if (!success) {
            return res.status(400).json({
                message: err
            });
        }

        return res.status(200).json({
            message: "Category deleted!"
        });
    }

    return res.status(405).json({
        message: "Method not allowed."
    });
};

export default category;