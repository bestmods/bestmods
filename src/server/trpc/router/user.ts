
import { adminProcedure, router } from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";

import { z } from "zod";

import { DeleteUser, InsertOrUpdateUser } from "@utils/user";

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
        })
});