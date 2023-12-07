import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "@server/db/client";

import { DeleteSource, InsertOrUpdateSource } from "@utils/content/source";

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
            description,
            classes 
        } : { 
            name?: string,
            description?: string,
            url: string, 
            classes?: string, 
            icon?: string,
            iremove?: boolean,
            banner?: string,
            bremove?: boolean 
        } = req.body;

        let preUrl: string | undefined = undefined;

        if (update) {
            // Retrieve pre URL if any.
            preUrl = req.query.url?.toString();

            if (!preUrl) {
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
                    url: preUrl ?? ""
                }
            });

            if (!src) {
                return res.status(404).json({
                    message: "Couldn't retrieve source (URL => " + preUrl + "). Source not found.",
                    data: null
                });
            }
        }

        const [src, success, err] = await InsertOrUpdateSource ({
            prisma: prisma,
            
            url: (update) ? preUrl ?? "" : url,
            
            update: update,

            name: name,
            description: description,
            classes: classes,

            icon: icon,
            banner: banner,

            iremove: iremove,
            bremove: bremove
        });

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

        const [success, err] = await DeleteSource ({
            prisma: prisma,
            url: url.toString()
        });

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