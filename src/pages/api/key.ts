import { type NextApiRequest, type NextApiResponse } from "next";

import { randomBytes } from "crypto";

import { prisma } from "@server/db/client";
import { CheckApiAccess } from "@utils/api";

export default async function Key (req: NextApiRequest, res: NextApiResponse) {
    // Retrieve our full API key and check for access.
    const key = process.env.API_AUTH_KEY ?? "";

    const [ret, err, method] = await CheckApiAccess({
        req: req,
        key: key,
        methods: ["GET", "POST", "DELETE"]
    });

    if (ret !== 200) {
        return res.status(ret).json({
            message: err
        })
    }

    // Check if we should retrieve.
    if (method === "GET") {

        const limit = Number(req.query.limit?.toString() ?? 10);
        const sort = Number(req.query?.sort?.toString() ?? 0);

        const keys = await prisma.apiKey.findMany({
            take: limit,
            orderBy: {
                ...(sort == 0 && {
                    id: "desc"
                }),
                ...(sort == 1 && {
                    id: "asc"
                })
            }
        })

        return res.status(200).json({
            keys: keys,
            message: `Received ${keys.length.toString()} keys!`
        });
    }
    // Check if we should generate.
    else if (method === "POST") {
        // Retrieve body data if any.
        const {
            ipAddr,
            agent,
            endPoint,
            method
        } : {
            ipAddr?: string
            agent?: string
            endPoint?: string
            method?: string
        } = req.body;

        // Generate new key.
        const key = randomBytes(48).toString("hex");

        // Add to database.
        try {
            await prisma.apiKey.create({
                data: {
                    key: key,

                    ipAddr: ipAddr,
                    agent: agent,
                    endPoint: endPoint,
                    method: method
                }
            })
        } catch (err) {
            console.error(err);

            return res.status(400).json({
                message: "Error creating API key in database. Check server console for more details."
            })
        }

        return res.status(200).json({
            key: key,
            
            ipAddr: ipAddr ?? null,
            agent: agent ?? null,
            endPoint: endPoint ?? null,
            method: method ?? null,

            message: "New API key generated!"
        })
    }
    // Check if we should delete.
    else if (method === "DELETE") {
        const { key } = req.query;

        if (!key) {
            return res.status(400).json({
                message: "Missing 'key' query parameter."
            })
        }

        // Delete key from database.
        try {
            await prisma.apiKey.delete({
                where: {
                    key: key.toString()
                }
            })

            return res.status(200).json({
                key: key.toString(),
                message: "Key deleted successfully!"
            })
        } catch (err) {
            console.error(err);

            return res.status(400).json({
                message: "Error deleting key from database. Please read server console for more details."
            })
        }
    }

    return res.status(405).json({
        message: "Method not allowed."
    })
}