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
    } else if (["POST", "PATCH", "PUT"].includes(req.method ?? "")) {
        const update = ["PATCH", "PUT"].includes(req.method ?? "");

        // Retrieve POST data.
        const { 
            url, 
            icon, 
            iremove, 
            banner, 
            bremove, 
            name, 
            classes 
        } : { 
            name?: string, 
            url: string, 
            classes?: string, 
            icon?: string,
            iremove?: boolean,
            banner?: string,
            bremove?: boolean 
        } = req.body;

        let pre_url: string | undefined = undefined;

        if (update) {
            // Retrieve pre URL if any.
            pre_url = req.query.url?.toString();

            if (!pre_url) {
                return res.status(400).json({
                    message: "Cannot update source. URL query parameter missing."
                });
            }
        }

        // If we're not updating, check to make sure we have a URL and name.
        if (!update && (!url || !name)) {
            return res.status(400).json({
                message: "Name or URL missing or too short.",
                data: null
            });
        }

        // If update is specified.
        if (update) {
            const src = await prisma.source.findFirst({
                where: {
                    url: pre_url ?? ""
                }
            });

            if (!src) {
                return res.status(404).json({
                    message: "Couldn't retrieve source (URL => " + pre_url + "). Source not found.",
                    data: null
                });
            }
        }

        const [src, success, err] = await Insert_Or_Update_Source(prisma, (update) ? pre_url ?? "" : url, update, icon, iremove, banner, bremove, name, classes);

        if (!success || !src) {
            return res.status(400).json({
                message: `Unable to ${update ? "update" : "insert"} source. Error => ${err}`,
                data: null
            });
        }

        return res.status(200).json({
            message: `${update ? "Updated" : "Inserted"} source successfully!`,
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