import { type NextApiRequest } from "next";

import { prisma } from "@server/db/client";

export async function CheckApiAccess ({
    req,
    key,
    addLog = true,
    methods
} : {
    req: NextApiRequest
    key?: string
    addLog?: boolean
    methods?: string[]
}): Promise<[number, string | null, string]> {
    const method = req.method;

    if (!method)
        return [405, "No method found.", ""];

    // Check for methods.
    if (typeof methods !== "undefined") {
        if (!method || !methods.includes(method))
            return [405, "Method not allowed.", method];
    }

    // Retrieve authorization header token and check.
    const fullClKey = req.headers.authorization;

    // Token check.
    if (!fullClKey)
        return [401, "No authorization token specified.", method];

    // Retrieve only the key.
    const clKey = fullClKey.split(" ")?.[1];

    if (!clKey) 
        return [400, "Authorization key malformed.", method];

    // Check if we should match against static key.
    if (typeof key !== "undefined") {
        if (!key)
            return [401, "Key to match is empty.", method];

        if (clKey !== key)
            return [401, "Keys do not match.", method]
    } else {
        // Attempt to retrieve key from database and check.
        const apiKey = await prisma.apiKey.findFirst({
            where: {
                key: clKey
            }
        });

        if (!apiKey)
            return [401, "Key not found in database.", method];

        // IP check.
        const ipAddr = req.headers?.["HTTP_CF_CONNECTING_IP"]?.toString() ?? req.socket.remoteAddress;

        if (apiKey.ipAddr && ipAddr !== apiKey.ipAddr)
            return [401, "IP address not allowed.", method];

        // Method check.
        if (apiKey.method && method !== apiKey.method)
            return [405, "Method not allowed.", method];

        // User agent check.
        const agent = req.headers?.["user-agent"];

        if (apiKey.agent && agent !== apiKey.agent)
            return [401, "User agent not allowed.", method];

        // Endpoint check.
        const endPoint = req.url;

        if (apiKey.endPoint && endPoint !== apiKey.endPoint)
            return [401, "Endpoint not allowed.", method];

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
                return [429, "Rate limit exceeded.", method]
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
    }

    return [200, null, method];
}