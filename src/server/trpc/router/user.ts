
import { adminProcedure, router } from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";

import { z } from "zod";

import { Delete_User, Insert_Or_Update_User } from "@utils/user";

export const userRouter = router({
    updateUser: adminProcedure
        .input(z.object({
            id: z.string(),

            name: z.string().optional(),
            email: z.string().optional(),

            avatar: z.string().optional(),
            aremove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const [user, success, err] = await Insert_Or_Update_User(ctx.prisma, input.id, input.name, input.email, input.avatar, input.aremove);

            if (!success || !user) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: (typeof err == "string") ? err : "Unable to add user."
                })
            }
        }),
    delUser: adminProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const [success, err] = await Delete_User(ctx.prisma, input.id);

            if (!success) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: (typeof err == "string") ? err : "Unable to edit user."
                });
            }
        })
});