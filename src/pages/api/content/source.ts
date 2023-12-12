import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "@server/db/client";

import { DeleteSource, InsertOrUpdateSource } from "@utils/content/source";
import { CheckApiAccess } from "@utils/content/api";

export default async function Source (req: NextApiRequest, res: NextApiResponse) {
    // Retrieve method and check.
    const method = req.method;

    if (!method) {
        return res.status(405).json({
            message: "No method specified."
        });
    }

    // Check API key.
    const token = req.headers.authorization;
    
    // Perform API access check.
    const [suc, err] = await CheckApiAccess({
        req: req
    });

    if (!suc) {
        return res.status(400).json({
            message: err
        });
    }

    // If this is a GET request, we are retrieving an item.
    if (method == "GET") {
        // Retrieve URL.
        const { url } = req.query;

        // Limit.
        const limit = Number(req.query?.limit?.toString() ?? 10);

        // Retrieve source and check.
        const srcs = await prisma.source.findMany({
            where: {
                ...(url && {
                    url: url.toString()
                })
            },
            take: limit
        });

        // Return source.
        return res.status(200).json({
            "message": `${srcs.length.toString()} sources fetched!`,
            data: {
                sources: srcs
            }
        });
    } else if (["POST", "PATCH", "PUT"].includes(method)) {
        const update = ["PATCH", "PUT"].includes(method);

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

        // If update is specified.
        if (update) {
            // Retrieve pre URL if any.
            preUrl = req.query.url?.toString();

            if (!preUrl) {
                return res.status(400).json({
                    message: "Cannot update source. URL query parameter missing."
                });
            }

            const src = await prisma.source.findFirst({
                where: {
                    url: preUrl
                }
            });

            if (!src) {
                return res.status(404).json({
                    message: `Couldn't retrieve source (URL => ${preUrl}. Source not found.`,
                    data: null
                });
            }
        } else {
            if (!url || !name) {
                return res.status(400).json({
                    message: "Name or URL missing or too short.",
                    data: null
                });
            }
        }

        const [src, success, err] = await InsertOrUpdateSource ({
            prisma: prisma,
            
            url: (update && preUrl) ? preUrl : url,
            
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