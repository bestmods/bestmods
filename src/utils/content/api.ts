import { type NextApiRequest } from "next";

import { prisma } from "@server/db/client";

export async function CheckApiAccess({
    req,
    addLog = true
} : {
    req: NextApiRequest
    addLog?: boolean
}): Promise<[boolean, string | null]> {
    // Retrieve authorization header token and check.
    const fullToken = req.headers.authorization;

    // Token check.
    if (!fullToken)
        return [false, "No authorization token specified."];

    // Retrieve only the key.
    const token = fullToken.split(" ")?.[1];

    if (!token) 
        return [false, "Authorization token malformed."];

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

    // Method check.
    const method = req.method;

    if (apiKey.method && method !== apiKey.method)
        return [false, "Method not allowed."];

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
                endPoint: endPoint,
                method: method
            }
        });
    }

    return [true, null];
}