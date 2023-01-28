import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const userRouter = router({
    checkPermission: protectedProcedure
        .input(z.object({
            name: z.string()
        }))
        .query( async ({ ctx, input }) => {
            const results = await ctx.prisma.permissions.findFirst({
                where: {
                    perm: input.name,
                    userId: ctx.session?.user?.id ?? ""
                }
            });
            
            if (results)
                return true;

            return false;
        })
});