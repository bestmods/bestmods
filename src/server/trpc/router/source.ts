import { z } from "zod";
import { router, publicProcedure, contributorProcedure } from "../trpc";

import fs from 'fs';
import FileType from '../../../utils/base64';
import { TRPCError } from "@trpc/server"
import { Delete_Source, Insert_Or_Update_Source } from "../../../utils/content/source";

export const sourceRouter = router({
    getSource: publicProcedure
        .input(z.object({
            url: z.string().nullable().default(null),

            selName: z.boolean().default(false),
            selUrl: z.boolean().default(false),
            selIcon: z.boolean().default(false),
            selBanner: z.boolean().default(false),
            selClasses: z.boolean().default(false)
        }))
        .query(({ ctx, input }) => {
            if (!input.url || input.url.length < 1)
                return null;

            return ctx.prisma.source.findFirst({
                where: {
                    url: input.url
                },
                select: {
                    name: input.selName,
                    url: input.selUrl,
                    icon: input.selIcon,
                    banner: input.selBanner,
                    classes: input.selClasses
                }
            });
        }),
    addSource: contributorProcedure
        .input(z.object({
            update: z.boolean().default(false),
            name: z.string(),
            url: z.string(),
            icon: z.string().nullable(),
            banner: z.string().nullable(),
            classes: z.string().nullable(),
            iremove: z.boolean(),
            bremove: z.boolean()
        }))
        .mutation(async ({ ctx, input }) => {
            const [src, success, err] = await Insert_Or_Update_Source(ctx.prisma, input.url, input.update, input.icon ?? undefined, input.iremove, input.banner ?? undefined, input.bremove, input.name, input.classes);

            if (!success || !src) {
                throw new TRPCError({
                    code: "PARSE_ERROR",
                    message: err
                });
            }
        }),
    delSource: contributorProcedure
        .input(z.object({
            url: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const [success, error] = await Delete_Source(ctx.prisma, input.url);

            if (!success) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: error
                });
            }
        }),
    getAllSources: publicProcedure
        .input(z.object({
            selName: z.boolean().default(false),
            selUrl: z.boolean().default(false),
            selIcon: z.boolean().default(false),
            selBanner: z.boolean().default(false),
            selClasses: z.boolean().default(false)
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.source.findMany({
                select: {
                    name: input.selName,
                    url: input.selUrl,
                    icon: input.selIcon,
                    banner: input.selBanner,
                    classes: input.selClasses
                }
            });
        })
});
