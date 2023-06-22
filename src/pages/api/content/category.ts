import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../../server/db/client";

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
        const { parent_id, name, name_short, url, classes, icon, has_bg } = req.body;

        // Retrieve ID if any.
        const { id } = req.query;

        if (!id && (!name || !name_short)) {
            return res.status(400).json({
                message: "Name or short name not found in POST data for new entry.",
                data: null
            });
        }

        if (id) {
            const cat = await prisma.category.update({
                where: {
                    id: id ? Number(id) : 0
                },
                data: {
                    ...(parent_id && {
                        parentId: Number(parent_id)
                    }),
                    ...(name && {
                        name: name
                    }),
                    ...(name_short && {
                        nameShort: name_short
                    }),
                    ...(url && {
                        url: url,
                    }),
                    ...(classes && {
                        classes: classes
                    }),
                    ...(icon && {
                        icon: icon
                    }),
                    ...(has_bg && {
                        hasBg: Boolean(has_bg)
                    })
                }
            });

            if (!cat) {
                return res.status(400).json({
                    message: "Did not update category successfully.",
                    data: null
                });
            }

            return res.status(200).json({
                message: "Updated category successfully!",
                data: {
                    category: cat
                }
            });
        } else {
            const cat = await prisma.category.create({
                data: {
                    parentId: (parent_id) ? Number(parent_id) : null,
                    name: name,
                    nameShort: name_short,
                    url: url,
                    classes: classes,
                    icon: icon,
                    hasBg: (has_bg) ? Boolean(has_bg) : false
                },
            });

            if (!cat) {
                return res.status(400).json({
                    message: "Did not create category successfully.",
                    data: null
                });
            }

            return res.status(200).json({
                message: "Created category successfully!",
                data: {
                    category: cat
                }
            });
        }
    }

    return res.status(405).json({
        message: "Method not allowed."
    });
};

export default category;