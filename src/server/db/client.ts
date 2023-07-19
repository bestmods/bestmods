import { PrismaClient } from "@prisma/client";

import { env } from "@env/server.mjs";

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prisma =
    global.prisma ||
    new PrismaClient({
        log:
            env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

// Enable the following for debugging Prisma queries.
/*
prisma.$on('query', (e) => {
    console.log('Query: ' + e.query)
    console.log('Params: ' + e.params)
    console.log('Duration: ' + e.duration + 'ms')
});
*/

if (env.NODE_ENV !== "production") {
    global.prisma = prisma;
}
