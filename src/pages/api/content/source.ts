import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../../server/db/client";
import { Insert_Or_Update_Source } from "../../../utils/content/source";

const source = async (req: NextApiRequest, res: NextApiResponse) => {
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
            url, 
            icon, 
            iremove, 
            banner, 
            bremove, 
            name, 
            classes } : { 
                name?: string, 
                url: string, 
                classes?: string, 
                icon?: string,
                iremove?: boolean,
                banner?: string,
                bremove?: boolean 
            } = req.body;

        // Retrieve pre URL if any.
        const { preUrl } = req.query;

        if (!preUrl && (!url || !name)) {
            return res.status(400).json({
                message: "Name or URL missing or too short.",
                data: null
            });
        }

        // If update is specified.
        if (preUrl) {
            const src = await prisma.source.findFirst({
                where: {
                    url: preUrl.toString()
                }
            });

            if (!src) {
                return res.status(404).json({
                    message: "Couldn't retrieve source (URL => " + preUrl + "). Source not found.",
                    data: null
                });
            }
        }

        const [src, success, err] = await Insert_Or_Update_Source(prisma, (url) ? url : preUrl?.toString() ?? "", (preUrl) ? true : false, icon, iremove, banner, bremove, name, classes);

        if (!success || !src) {
            return res.status(400).json({
                message: `Source ${preUrl ? "update" : "insert"} not successful. Error => ` + err,
                data: null
            });
        }

        return res.status(200).json({
            message: `${preUrl ? "Updated" : "Inserted"} category successfully!`,
            data: {
                source: src
            }
        })
    }

    return res.status(405).json({
        message: "Method not allowed."
    });
};

export default source;