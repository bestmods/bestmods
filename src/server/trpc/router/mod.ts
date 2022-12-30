import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const modRouter = router({
  suggestMod: publicProcedure
    .input(
      z.object({
        name: z.string(),
        url: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.mod.create({
          data: {
            name: input.name,
            url: input.url,
            description: input.description,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }),
  addMod: publicProcedure.input(z.object({
    source: z.number().positive(),
    category: z.number().positive(),
    name: z.string(),
    image: z.string().nullable(),
    description: z.string(),
    description_short: z.string(),
    url: z.string(),
    custom_url: z.string(),
    install: z.string().nullable(),
    downloads: z.string().nullable(),
    screenshots: z.string().nullable()
  }))
  .mutation(async ({ ctx, input }) => {
    try {
      // First, retrieve source and category.
      const source = ctx.prisma.source.findFirst({ where: {
        id: input.source
      }});

      // Make sure we have a valid source.
      if (source == null)
      {
        console.log("Source is invalid! Source ID => " + input.source);

        return;
      }

      const category = ctx.prisma.category.findFirst({ where: {
        id: input.category
      }});

      if (category == null)
      {
        console.log("Category is invalid! Category ID => " + input.category);

        return;
      }

      // Retrieve downloads.

      // Retrieve screenshots.


      await ctx.prisma.mod.create({
        data: {
          name: input.name,
          description: input.description,
          description_short: input.description_short,
          url: input.url,
          custom_url: input.custom_url,
        }
      })
    } catch (error) {
      console.log(error);
    }
  }),
  getAllMods: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.mod.findMany();
  }),
});
