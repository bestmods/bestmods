import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const categoryRouter = router({
  addCategory: publicProcedure
    .input(
      z.object({
        name: z.string(),
        url: z.string(),
        icon: z.string().nullable(),
        banner: z.string().nullable(),
        classes: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.category.create({
          data: {
            name: input.name,
            icon: input.icon ?? null,
            banner: input.banner ?? null,
            classes: input.classes ?? null,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }),
  getAllCategories: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany();
  })
});
