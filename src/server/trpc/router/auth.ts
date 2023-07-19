import { router, publicProcedure } from "@server/trpc/trpc";

export const authRouter = router({
    getSession: publicProcedure.query(({ ctx }) => {
        return ctx.session;
    })
});
