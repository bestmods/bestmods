import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../../server/db/client";
import { Delete_Category, Insert_Or_Update_Category } from "../../../utils/content/category";

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
    } else if (req.method == "POST") {
        // Retrieve POST data.
        const {
            parent_id,
            name,
            name_short,
            url,
            classes,
            icon,
            iremove,
            has_bg 
        } : { 
            parent_id?: number,
            name?: string,
            name_short?: string,
            url?: string,
            classes?: string,
            icon?: string,
            iremove?: boolean,
            has_bg?: boolean
        } = req.body;

        // Retrieve ID if any.
        const { id } = req.query;

        if (!id && (!name || !name_short)) {
            return res.status(400).json({
                message: "Name or short name not found in POST data for new entry.",
                data: null
            });
        }

        // If the ID is specified, do a lookup here.
        if (id) {
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

        const [cat, success, err] = await Insert_Or_Update_Category(prisma, name, name_short, url, (id) ? Number(id) : undefined, icon, iremove, parent_id, classes, has_bg);

        if (!success || !cat) {
            return res.status(400).json({
                message: `Category ${id ? "update" : "insert"} not successful. Error => ` + err,
                data: null
            });
        }

        return res.status(200).json({
            message: `${id ? "Updated" : "Inserted"} category successfully!`,
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

        const [success, err] = await Delete_Category(prisma, Number(id.toString()));

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