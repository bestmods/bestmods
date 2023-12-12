import { type NextApiRequest } from "next";

import { prisma } from "@server/db/client";

export async function CheckApiAccess({
    req,
    token,
    addLog = true
} : {
    req: NextApiRequest
    token?: string
    addLog?: boolean
}): Promise<[boolean, string | null]> {
    // Token check.
    if (!token)
        return [false, "No authorization token specified."];

    // Attempt to retrieve key from database and check.
    const apiKey = await prisma.apiKey.findFirst({
        where: {
            key: token
        }
    });

    if (!apiKey)
        return [false, "No key found in database."];

    // IP check.
    const ipAddr = req.socket.remoteAddress;

    if (apiKey.ipAddr && ipAddr !== apiKey.ipAddr)
        return [false, "IP address not allowed."];

    // User agent check.
    const agent = req.headers?.["user-agent"];

    if (apiKey.agent && agent !== apiKey.agent)
        return [false, "User agent not allowed."];

    // Endpoint check.
    const endPoint = req.url;

    if (apiKey.endPoint && endPoint !== apiKey.endPoint)
        return [false, "Endpoint not allowed."];

    // Rate limit check.
    const rateLimit = apiKey.rateLimit;

    if (rateLimit) {
        const hourAgo = new Date(Date.now() - 3600);

        const hits = await prisma.apiLog.count({
            where: {
                apiKeyId: apiKey.id,
                createdAt: {
                    gte: hourAgo
                }
            }
        })

        if (hits > rateLimit)
            return [false, `Rate limit exceeded (${hits.toString()} > ${rateLimit.toString()}).`]
    }

    // Check if we should insert into log since we're successful.
    if (addLog) {
        await prisma.apiLog.create({
            data: {
                apiKeyId: apiKey.id,
                ipAddr: ipAddr,
                agent: agent,
                endPoint: endPoint
            }
        });
    }

    return [true, null];
}