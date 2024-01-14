
import { adminProcedure, router } from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";

import { z } from "zod";

import { DeleteUser, InsertOrUpdateUser } from "@utils/user";
import { UserRole } from "@prisma/client";

export const userRouter = router({
    update: adminProcedure
        .input(z.object({
            id: z.string(),

            name: z.string().optional(),
            email: z.string().optional(),

            avatar: z.string().optional(),
            aremove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const [user, success, err] = await InsertOrUpdateUser ({
                prisma: ctx.prisma,
                
                lookupId: input.id,

                name: input.name,
                email: input.email,

                avatar: input.avatar,
                aremove: input.aremove
            });

            if (!success || !user) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: (typeof err == "string") ? err : "Unable to add user."
                })
            }
        }),
    del: adminProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const [success, err] = await DeleteUser ({
                prisma: ctx.prisma,
                id: input.id
            });

            if (!success) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: (typeof err == "string") ? err : "Unable to edit user."
                });
            }
        }),
    addRole: adminProcedure
        .input(z.object({
            id: z.string(),
            role: z.nativeEnum(UserRole)
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.user.update({
                    data: {
                        roles: {
                            push: input.role 
                        }
                    },
                    where: {
                        id: input.id
                    }
                })
            } catch (error: unknown) {
                throw new TRPCError({
                    message: `Error adding role '${input.role}' to user '${input.id}'. Error => ${error}`,
                    code: "BAD_REQUEST"
                });
            }
        }),
    delRole: adminProcedure
        .input(z.object({
            id: z.string(),
            role: z.nativeEnum(UserRole)
        }))
        .mutation(async ({ ctx, input}) => {
            try {
                // Retrieve current user.
                const user = await ctx.prisma.user.findFirstOrThrow({
                    where: {
                        id: input.id
                    }
                })

                // Copy new roles.
                const newRoles = user.roles;

                // Find existing role and remove.
                const idx = user.roles.findIndex(tmp => tmp == input.role);

                if (idx !== -1)
                    newRoles.splice(idx, 1);

                // Update user with new roles.
                await ctx.prisma.user.update({
                    data: {
                        roles: {
                            set: newRoles
                        }
                    },
                    where: {
                        id: input.id
                    }
                })
            } catch (error: unknown) {
                throw new TRPCError({
                    message: `Error deleting role '${input.role}' for user '${input.id}'. Error => ${error}`,
                    code: "BAD_REQUEST"
                });
            }
        }),
        getAll: adminProcedure
            .input(z.object({
                search: z.string().optional(),
                cursor: z.string().nullish(),
                limit: z.number().max(10).default(10)
            }))
            .query(async ({ ctx, input }) => {
                const users = await ctx.prisma.user.findMany({
                    take: input.limit + 1,
                    cursor: input.cursor ? { id: input.cursor } : undefined,
                    where: {
                        ...(input.search && {
                            OR: [
                                {
                                    name: {
                                        contains: input.search
                                    }
                                },
                                {
                                    email: {
                                        contains: input.search
                                    }
                                }
                            ]
                        })
                    }
                })

                let nextCur: typeof input.cursor | undefined = undefined;

                if (users.length > input.limit) {
                    const nextUser = users.pop();

                    if (nextUser)
                        nextCur = nextUser.id;
                }

                return {
                    users,
                    nextCur
                }
            })
});