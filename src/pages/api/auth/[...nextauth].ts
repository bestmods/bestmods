import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";
import { type Permissions } from "@prisma/client";

export const authOptions: NextAuthOptions = {
    // Include user.id on session
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;

                // Retrieve user permissions and assign to session.
                let permissions: Permissions[] = [];

                try {
                    permissions = await prisma.permissions.findMany({
                        where: {
                            userId: user.id,
                        }
                    });
                } catch (error) {
                    console.error(error);
                }

                // Assign permissions to our session user data.
                if (permissions)
                    session.user.permissions = permissions.map(perm => perm.perm);
            }

            return session;
        },
    },
    // Configure one or more authentication providers
    adapter: PrismaAdapter(prisma),
    providers: [
        DiscordProvider({
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
        }),
        // ...add more providers here
    ],
};

export default NextAuth(authOptions);
