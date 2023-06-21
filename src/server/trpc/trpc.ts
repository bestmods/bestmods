import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import { type Context } from "./context";

import { z } from "zod";

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
    if (!ctx.session?.user)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    const lookUp = await ctx.prisma.permissions.findFirst({
        where: {
            userId: ctx.session.user.id,
            perm: "contributor"
        }
    });

    if (!lookUp)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    return next({
        ctx: {
            session: { ...ctx.session, user: ctx.session.user }
        }
    })
})

export const contributorProcedure = t.procedure.use(isContributor);

const isAdmin = t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    const lookUp = await ctx.prisma.permissions.findFirst({
        where: {
            userId: ctx.session.user.id,
            perm: "admin"
        }
    });

    if (!lookUp)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    return next({
        ctx: {
            session: { ...ctx.session, user: ctx.session.user }
        }
    })
})

export const adminProcedure = t.procedure.use(isAdmin);

export const modInputSchema = z.object({
    modId: z.string().nullable(),
    id: z.string().nullable(),

    userId: z.number()
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
    const mod = ctx.prisma.mod.findFirst({
        select: {
            owner: true
        },
        where: {
            ownerId: modId
        }
    });

    if (!mod)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    // Are we valid?
    if (mod.owner.id != input.userId)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    return next({
        ctx: {
            session: { ...ctx.session, user: ctx.session.user }
        }
    })
})

export const ownsModProcedure = t.procedure.use(ownsMod);