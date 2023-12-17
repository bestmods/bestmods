import { initTRPC, TRPCError } from "@trpc/server";
import { type Context } from "@server/trpc/context";

import { z } from "zod";

import superjson from "superjson";

const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape }) {
        return shape;
    },
});

export const router = t.router;

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure;

/**
 * Reusable middleware to ensure
 * users are logged in
 */
const isAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: {
            // infers the `session` as non-nullable
            session: { ...ctx.session, user: ctx.session.user },
        },
    });
});

/**
 * Protected procedure
 **/
export const protectedProcedure = t.procedure.use(isAuthed);

const isContributor = t.middleware(async ({ ctx, next }) => {
    const user = ctx.session?.user;

    if (!user)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    if (!user.roles.includes("ADMIN") && !user.roles.includes("CONTRIBUTOR"))
        throw new TRPCError({ code: "UNAUTHORIZED" });

    return next({
        ctx: {
            session: { ...ctx.session, user: user }
        }
    })
})

export const contributorProcedure = t.procedure.use(isContributor);

const isAdmin = t.middleware(async ({ ctx, next }) => {
    const user = ctx.session?.user;

    if (!user)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    if (!user.roles.includes("ADMIN"))
        throw new TRPCError({ code: "UNAUTHORIZED" });

    return next({
        ctx: {
            session: { ...ctx.session, user: user }
        }
    })
})

export const adminProcedure = t.procedure.use(isAdmin);

export const modInputSchema = z.object({
    modId: z.string().nullable(),
    id: z.string().nullable(),

    userId: z.string()
})

const ownsMod = t.middleware(async ({ ctx, rawInput, next }) => {
    if (!ctx.session?.user)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    // Parse input and get mod ID.
    const res = modInputSchema.safeParse(rawInput);

    if (!res.success)
        throw new TRPCError({ code: "BAD_REQUEST" })

    const input = res.data;

    if (input.modId == null && input.id == null)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    const modId = input.modId ?? input.id;

    // Now retrieve our mod and compare to user ID.
    const mod = await ctx.prisma.mod.findFirst({
        select: {
            ownerId: true
        },
        where: {
            ownerId: modId
        }
    });

    if (!mod)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    // Are we valid?
    if (!mod.ownerId || mod.ownerId != input.userId)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    return next({
        ctx: {
            session: { ...ctx.session, user: ctx.session.user }
        }
    })
})

export const ownsModProcedure = t.procedure.use(ownsMod);