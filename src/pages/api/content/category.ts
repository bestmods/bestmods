import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "@server/db/client";

import { DeleteCategory, InsertOrUpdateCategory } from "@utils/content/category";
import { CheckApiAccess } from "@utils/api";

import { s3 } from "@server/aws/s3";

export const config = {
    api: {
        responseLimit: "8mb",
        bodyParser: {
            sizeLimit: "8mb"
        }
    },
}

export default async function Category (req: NextApiRequest, res: NextApiResponse) {
    // Perform API access check.
    const [ret, err, method] = await CheckApiAccess({
        req: req,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
    });

    if (ret !== 200) {
        return res.status(ret).json({
            message: err
        });
    }

    // If this is a GET request, we are retrieving an item.
    if (method == "GET") {
        // Retrieve ID and check.
        const { id } = req.query;

        // Limit.
        const limit = Number(req.query?.limit?.toString() ?? 10);

        // Retrieve category and check.
        const cats = await prisma.category.findMany({
            include: {
                parent: true,
                children: true
            },
            where: {
                ...(id && {
                    id: Number(id.toString())
                })
            },
            take: limit
        });

        // Return category.
        return res.status(200).json({
            "message": `${cats.length.toString()} categories fetched!`,
            data: cats
        });
    } else if (["POST", "PATCH", "PUT"].includes(method)) {
        // Check if this should be an update.
        const update = ["PATCH", "PUT"].includes(method);

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

        // If the ID is specified, do a lookup here.
        if (update) {
            id = req.query.id?.toString();

            if (!id) {
                return res.status(400).json({
                    message: "Cannot update category. Missing ID query parameter."
                });
            }

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
        } else {
            if (!name || !nameShort) {
                return res.status(400).json({
                    message: "Name or short name not found in POST data for new entry.",
                    data: null
                });
            }
        }

        const [cat, success, err] = await InsertOrUpdateCategory ({
            prisma: prisma,
            s3: s3,

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
            data: cat
        })
    } else if (method == "DELETE") {
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
}