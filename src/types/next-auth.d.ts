import { type DefaultSession } from "next-auth";

import {type Permissions} from '@prisma/client';

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user?: {
            id: string;
            permissions: string[]
        } & DefaultSession["user"];
    }
}
