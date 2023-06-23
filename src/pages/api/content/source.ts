import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../../server/db/client";
import { Delete_Source, Insert_Or_Update_Source } from "../../../utils/content/source";

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
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                message: "No URL present.",
                data: null
            });
        }

        // Retrieve source and check.
        const src = await prisma.source.findFirst({
            where: {
                url: url.toString()
            }
        });

        if (!src) {
            return res.status(404).json({
                message: "Source URL " + url + " not found.",
                data: null
            });
        }

        // Return source.
        return res.status(200).json({
            "message": "Source fetched!",
            data: {
                src: src
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
            message: `${preUrl ? "Updated" : "Inserted"} source successfully!`,
            data: {
                source: src
            }
        })
    } else if (req.method == "DELETE") {
        const { url } = req.query;

        if (!url) {
            return res.status(404).json({
                message: "Source URL not present."
            });
        }

        // Check if exists.
        const src = await prisma.source.findFirst({
            where: {
                url: url.toString()
            }
        });

        if (!src) {
            return res.status(400).json({
                message: "Source URL " + url.toString() + " not found."
            });
        }

        const [success, err] = await Delete_Source(prisma, url.toString());

        if (!success) {
            return res.status(400).json({
                message: err
            });
        }

        return res.status(200).json({
            message: "Source deleted!"
        });
    }

    return res.status(405).json({
        message: "Method not allowed."
    });
};

export default source;