import { NextApiRequest, NextApiResponse } from "next";

import { randomBytes } from "crypto";

import { prisma } from "@server/db/client";

export default async function Key (req: NextApiRequest, res: NextApiResponse) {
    // Retrieve method and check.
    const method = req.method;

    if (!method) {
        return res.status(405).json({
            message: "No method specified."
        })
    }

    // Retrieve full token and check.
    const fullToken = req.headers.authorization;

    if (!fullToken) {
        return res.status(401).json({
            message: "No authorization token specified."
        })
    }

    const token = fullToken.split(" ")?.[1];

    if (!token) {
        return res.status(401).json({
            message: "Authorization token malformed."
        })
    }

    // Retrieve our full API key and check.
    const apiKey = process.env.API_AUTH_KEY;

    if (!apiKey) {
        return res.status(404).json({
            message: "Root API key not specified on server-side."
        })
    }

    // Check if we have access to generate keys.
    if (apiKey !== token) {
        return res.status(401).json({
            message: `Unauthorized. Tokens do not match. (${apiKey} != ${token})`
        })
    }

    // Check if we should generate.
    if (method === "POST") {
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
    } else if (method === "DELETE") {
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