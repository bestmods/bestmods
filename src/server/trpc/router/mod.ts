import { z } from "zod";
import { router, publicProcedure, protectedProcedure, contributorProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"
import { Insert_Or_Update_Mod } from "../../../utils/content/mod";
import { type ModRowBrowser } from "../../../components/types";

import { Prisma } from "@prisma/client";

export const modRouter = router({
    addMod: contributorProcedure
        .input(z.object({
            id: z.number().optional(),
            visible: z.boolean().default(true),

            owner_id: z.string().optional(),
            owner_name: z.string().optional(),

            name: z.string(),
            banner: z.string().optional(),
            url: z.string(),
            category: z.number().optional(),

            // The following should be parsed via Markdown Syntax.
            description: z.string(),
            description_short: z.string(),
            install: z.string().optional(),

            // Relation data (we try to replicate Prisma types for consistency).
            downloads: z.array(z.object({
                name: z.string().nullable(),
                url: z.string(),

                // Required for ModDownload type.
                modId: z.number()
            })),
            screenshots: z.array(z.object({
                url: z.string(),

                // Required for ModScreenshot type.
                modId: z.number()
            })),
            sources: z.array(z.object({
                sourceUrl: z.string(),
                query: z.string(),

                // Required for ModSource type.
                modId: z.number(),
                primary: z.boolean()
            })),
            installers: z.array(z.object({
                sourceUrl: z.string(),
                url: z.string(),

                // Required for ModInstaller type.
                modId: z.number()
            })),
            credits: z.array(z.object({
                name: z.string(),
                credit: z.string(),

                // Required for ModCredit type.
                id: z.number(),
                modId: z.number(),
                userId: z.string().nullable()
            })),
            bremove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            // Insert ot update mod.
            const [mod, success, err] = await Insert_Or_Update_Mod(ctx.prisma, input.name, input.url, input.description, input.visible, input.id, undefined, input.owner_id, input.owner_name, input.banner, input.bremove, input.category, input.description_short, input.install, input.downloads, input.screenshots, input.sources, input.installers, input.credits);

            // Check for error.
            if (!success || !mod) {
                throw new TRPCError({
                    code: "PARSE_ERROR",
                    message: err
                });
            }
        }),
    setModVisibility: contributorProcedure
        .input(z.object({
            id: z.number(),
            visible: z.boolean().default(true)
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.mod.update({
                    where: {
                        id: input.id
                    },
                    data: {
                        visible: input.visible
                    }
                });
            } catch (error) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: (typeof error == "string") ? error : "Unable to set mod's visibility"
                });
            }
        }),
    delMod: contributorProcedure
        .input(z.object({
            id: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.mod.delete({
                    where: {
                        id: input.id
                    }
                });
            } catch (error) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: (typeof error == "string") ? error : "Unable to delete mod."
                });
            }
        }),
    getAllModsBrowser: publicProcedure
        .input(z.object({
            cursor: z.number().nullish(),
            count: z.number().default(10),

            categories: z.string().optional(),
            search: z.string().optional(),
            timeframe: z.number().default(0),
            sort: z.number().default(0),

            visible: z.boolean().default(false),
        }))
        .query(async ({ ctx, input }) => {
            const count = input.count;
            
            // Check if we want to retrieve mod rating within specific range.
            let time_range: number | undefined = undefined;

            switch (input.timeframe) {
                case 0:
                    time_range = 3600;
        
                    break;
        
                case 1:
                    time_range = 86400;
        
                    break;
        
                case 2:
                    time_range = 604800;
        
                    break;
        
                case 3:
                    time_range = 2629800;
        
                    break;
        
                case 4:
                    time_range = 311556952;
        
                    break;
            }
        
            let time_range_date: Date | undefined = undefined;
        
            if (time_range) {
                time_range_date = new Date(Date.now() - (time_range * 1000));

                // We need to convert to UTC properly.
                time_range_date = new Date(
                    time_range_date.getUTCFullYear(),
                    time_range_date.getUTCMonth(),
                    time_range_date.getUTCDate(),
                    time_range_date.getUTCHours(),
                    time_range_date.getUTCMinutes(),
                    time_range_date.getUTCSeconds(),
                    time_range_date.getUTCMilliseconds()
                );
            }

            // Process categories.
            const cats_arr = JSON.parse(input.categories ?? "[]");

            // Retrieve the cursor item and fields we need to use as the cursor.
            let cursor_item: ModRowBrowser | undefined = undefined;
            let cursor_item_editAt: Date | undefined = undefined;
            let cursor_item_createAt: Date | undefined = undefined;

            if (input.cursor) {
                const cursor_items = await ctx.prisma.$queryRaw<ModRowBrowser[]>`
                    SELECT
                        "Mod"."id",
                        "Mod"."totalViews",
                        "Mod"."totalDownloads",
                        "Mod"."editAt",
                        "Mod"."createAt",
                        (
                            (
                                SELECT
                                    COUNT(*) 
                                FROM
                                    "ModRating" 
                                WHERE 
                                        "ModRating"."modId"="Mod"."id" 
                                    AND 
                                        "ModRating"."positive" = true
                                    ${time_range_date ?
                                            Prisma.sql`AND "ModRating"."createdAt" > ${time_range_date}`
                                        :
                                            Prisma.empty
                                    }
                            )
                                -
                            (
                                SELECT
                                    COUNT(*)
                                FROM
                                    "ModRating"
                                WHERE 
                                        "ModRating"."modId"="Mod"."id"
                                    AND
                                        "ModRating"."positive" = false
                                    ${time_range_date ?
                                            Prisma.sql`AND "ModRating"."createdAt" > ${time_range_date}`
                                        :
                                            Prisma.empty
                                    }
                            )
                        ) + 1 AS "rating"
                    FROM
                        "Mod"
                    WHERE
                        "Mod"."id" = ${input.cursor}
                `;

                cursor_item = cursor_items[0] ?? undefined;
                
                // Since the editAt and createAt columns don't include a time zone in the string, it uses the server's time which we don't want. Therefore, convert the time zones to UTC for global dates.
                if (cursor_item) {
                    cursor_item_editAt = new Date(
                        cursor_item.editAt.getUTCFullYear(),
                        cursor_item.editAt.getUTCMonth(),
                        cursor_item.editAt.getUTCDate(),
                        cursor_item.editAt.getUTCHours(),
                        cursor_item.editAt.getUTCMinutes(),
                        cursor_item.editAt.getUTCSeconds(),
                        cursor_item.editAt.getUTCMilliseconds()
                    );

                    cursor_item_createAt = new Date(
                        cursor_item.createAt.getUTCFullYear(),
                        cursor_item.createAt.getUTCMonth(),
                        cursor_item.createAt.getUTCDate(),
                        cursor_item.createAt.getUTCHours(),
                        cursor_item.createAt.getUTCMinutes(),
                        cursor_item.createAt.getUTCSeconds(),
                        cursor_item.createAt.getUTCMilliseconds()
                    );
                }
            }
            
            // Perform a complex raw Prisma query for PostgreSQL.
            // Unfortunately, we can't use standard Prisma queries due to the below.
            // https://github.com/bestmods/bestmods/issues/23
            const items = await ctx.prisma.$queryRaw<ModRowBrowser[]>` 
                SELECT 
                    "Mod".*,
                    (
                        (
                            SELECT
                                COUNT(*) 
                            FROM
                                "ModRating" 
                            WHERE 
                                    "ModRating"."modId"="Mod"."id" 
                                AND 
                                    "ModRating"."positive" = true
                                ${time_range_date ?
                                        Prisma.sql`AND "ModRating"."createdAt" > ${time_range_date}`
                                    :
                                        Prisma.empty
                                }
                        )
                            -
                        (
                            SELECT
                                COUNT(*)
                            FROM
                                "ModRating"
                            WHERE 
                                    "ModRating"."modId"="Mod"."id"
                                AND
                                    "ModRating"."positive" = false
                                ${time_range_date ?
                                        Prisma.sql`AND "ModRating"."createdAt" > ${time_range_date}`
                                    :
                                        Prisma.empty
                                }
                        )
                    ) + 1 AS "rating",
                    json_build_object(
                        'id', "category"."id",
                        'parentId', "category"."parentId",
                        'parent', 
                        CASE 
                            WHEN "categoryparent"."id" IS NOT NULL THEN 
                                json_build_object(
                                    'id', "categoryparent"."id",
                                    'name', "categoryparent"."name",
                                    'url', "categoryparent"."url",
                                    'icon', "categoryparent"."icon"
                                )
                            ELSE
                                NULL
                        END,
                        'name', "category"."name",
                        'url', "category"."url",
                        'icon', "category"."icon"
                    ) AS "category",
                    json_agg(DISTINCT "ModDownload".*) AS "ModDownload",
                    (
                        SELECT json_agg(jsonb_build_object(
                            'sourceUrl', "subquery"."sourceUrl",
                            'query', "subquery"."query",
                            'source', CASE 
                                WHEN "subquery"."sourceUrl" IS NOT NULL THEN
                                    jsonb_build_object(
                                        'name', "subquery"."sourceName",
                                        'url', "subquery"."sourceUrl",
                                        'icon', "subquery"."sourceIcon"
                                    )
                                ELSE
                                    NULL
                            END
                        )) AS "ModSource"
                        FROM (
                            SELECT DISTINCT ON ("ModSource"."sourceUrl")
                                "ModSource"."sourceUrl",
                                "ModSource"."query",
                                "modsourcesource"."name" AS "sourceName",
                                "modsourcesource"."icon" AS "sourceIcon"
                            FROM "ModSource"
                            LEFT JOIN
                                "Source" 
                                AS 
                                    "modsourcesource"
                                ON
                                    "ModSource"."sourceUrl" = "modsourcesource"."url"
                            WHERE
                                "Mod"."id" = "ModSource"."modId"
                        ) AS "subquery"
                    ) AS "ModSource",
                    (
                        SELECT json_agg(jsonb_build_object(
                            'sourceUrl', "subquery"."sourceUrl",
                            'url', "subquery"."url",
                            'source', CASE 
                                WHEN "subquery"."sourceUrl" IS NOT NULL THEN
                                    jsonb_build_object(
                                        'name', "subquery"."sourceName",
                                        'url', "subquery"."sourceUrl",
                                        'icon', "subquery"."sourceIcon"
                                    )
                                ELSE
                                    NULL
                            END
                        )) AS "ModInstaller"
                        FROM (
                            SELECT DISTINCT ON ("ModInstaller"."sourceUrl")
                                "ModInstaller"."sourceUrl",
                                "ModInstaller"."url",
                                "modinstallersource"."name" AS "sourceName",
                                "modinstallersource"."icon" AS "sourceIcon"
                            FROM
                                "ModInstaller"
                            LEFT JOIN
                                "Source"
                                AS
                                    "modinstallersource"
                                ON
                                    "ModInstaller"."sourceUrl" = "modinstallersource"."url"
                            WHERE
                                "Mod"."id" = "ModInstaller"."modId"
                        ) AS "subquery"
                    ) AS "ModInstaller",
                    json_agg(DISTINCT "ModRating".*) AS "ModRating"
                FROM 
                    "Mod"
                LEFT JOIN 
                    "Category"
                    AS
                        "category"
                    ON
                        "Mod"."categoryId" = "category"."id"
                LEFT JOIN
                    "Category"
                    AS
                        "categoryparent"
                    ON
                        "category"."parentId" = "categoryparent"."id"
                LEFT JOIN
                    "ModDownload"
                    ON
                        "Mod"."id" = "ModDownload"."modId"
                LEFT JOIN
                    "ModSource"
                    ON
                        "Mod"."id" = "ModSource"."modId"
                LEFT JOIN
                    "ModInstaller"
                    ON 
                        "Mod"."id" = "ModInstaller"."modId"
                LEFT JOIN
                    "ModRating"
                    ON
                            "Mod"."id" = "ModRating"."modId"
                        AND
                            "ModRating"."userId" = ${ctx.session?.user?.id ?? ""}
                WHERE
                    ${cats_arr.length > 0 ?
                            Prisma.sql`"Mod"."categoryId" IN (${Prisma.join(cats_arr)}) ${(input.visible != undefined || input.search || input.cursor) ? Prisma.sql`AND` : Prisma.empty}`
                        :
                            Prisma.empty
                    }
                    ${input.visible != undefined ?
                            Prisma.sql`"Mod"."visible" = ${input.visible} ${(input.search || input.cursor) ? Prisma.sql`AND` : Prisma.empty}`
                        :
                            Prisma.empty
                    }
                    ${input.search ?
                            Prisma.sql`(
                                "Mod"."name" ILIKE ${"%" + input.search + "%"} OR
                                "Mod"."descriptionShort" ILIKE ${"%" + input.search + "%"} OR
                                "Mod"."ownerName" ILIKE ${"%" + input.search + "%"} OR
                                "category"."name" ILIKE ${"%" + input.search + "%"} OR
                                "category"."nameShort" ILIKE ${"%" + input.search + "%"}
                            ) ${input.cursor ? Prisma.sql`AND` : Prisma.empty}`
                        :
                            Prisma.empty
                    }
                    ${cursor_item ?
                            Prisma.sql`
                                (
                                    (
                                        ${input.sort == 0 ?
                                            Prisma.sql`
                                                (
                                                    SELECT
                                                        COUNT(*) 
                                                    FROM
                                                        "ModRating" 
                                                    WHERE 
                                                            "ModRating"."modId"="Mod"."id" 
                                                        AND 
                                                            "ModRating"."positive" = true
                                                        ${time_range_date ?
                                                                Prisma.sql`AND "ModRating"."createdAt" > ${time_range_date}`
                                                            :
                                                                Prisma.empty
                                                        }
                                                )
                                                    -
                                                (
                                                    SELECT
                                                        COUNT(*)
                                                    FROM
                                                        "ModRating"
                                                    WHERE 
                                                            "ModRating"."modId"="Mod"."id"
                                                        AND
                                                            "ModRating"."positive" = false
                                                        ${time_range_date ?
                                                                Prisma.sql`AND "ModRating"."createdAt" > ${time_range_date}`
                                                            :
                                                                Prisma.empty
                                                        }
                                                ) + 1 = ${cursor_item.rating}`
                                            :
                                                Prisma.empty
                                        }
                                        ${input.sort == 1 ?
                                                Prisma.sql`"Mod"."totalViews" = ${cursor_item.totalViews}`
                                            :
                                                Prisma.empty
                                        }
                                        ${input.sort == 2 ?
                                                Prisma.sql`"Mod"."totalDownloads" = ${cursor_item.totalDownloads}`
                                            :
                                                Prisma.empty
                                        }
                                        ${input.sort == 3 && cursor_item_editAt ?
                                                Prisma.sql`"Mod"."editAt" = ${cursor_item_editAt}`
                                            :
                                                Prisma.empty
                                        }
                                        ${input.sort == 4 && cursor_item_createAt ?
                                                Prisma.sql`"Mod"."createAt" = ${cursor_item_createAt}`
                                            :
                                                Prisma.empty
                                        }
                                        AND
                                            "Mod"."id" <= ${cursor_item.id}
                                    )
                                    OR
                                    (
                                        ${input.sort == 0 ?
                                                Prisma.sql`
                                                    (
                                                        SELECT
                                                            COUNT(*) 
                                                        FROM
                                                            "ModRating" 
                                                        WHERE 
                                                                "ModRating"."modId"="Mod"."id" 
                                                            AND 
                                                                "ModRating"."positive" = true
                                                            ${time_range_date ?
                                                                    Prisma.sql`AND "ModRating"."createdAt" > ${time_range_date}`
                                                                :
                                                                    Prisma.empty
                                                            }
                                                    )
                                                        -
                                                    (
                                                        SELECT
                                                            COUNT(*)
                                                        FROM
                                                            "ModRating"
                                                        WHERE 
                                                                "ModRating"."modId"="Mod"."id"
                                                            AND
                                                                "ModRating"."positive" = false
                                                            ${time_range_date ?
                                                                    Prisma.sql`AND "ModRating"."createdAt" > ${time_range_date}`
                                                                :
                                                                    Prisma.empty
                                                            }
                                                    ) + 1 < ${cursor_item.rating}`
                                            :
                                                Prisma.empty
                                        }
                                        ${input.sort == 1 ?
                                                Prisma.sql`"Mod"."totalViews" < ${cursor_item.totalViews}`
                                            :
                                                Prisma.empty
                                        }
                                        ${input.sort == 2 ?
                                                Prisma.sql`"Mod"."totalDownloads" < ${cursor_item.totalDownloads}`
                                            :
                                                Prisma.empty
                                        }
                                        ${input.sort == 3 && cursor_item_editAt ?
                                                Prisma.sql`"Mod"."editAt" < ${cursor_item_editAt}`
                                            :
                                                Prisma.empty
                                        }
                                        ${input.sort == 4 && cursor_item_createAt ?
                                                Prisma.sql`"Mod"."createAt" < ${cursor_item_createAt}`
                                            :
                                                Prisma.empty
                                        }
                                    )
                                )
                            `
                        :
                            Prisma.empty
                    }
                GROUP BY
                    "Mod"."id",
                    "category"."id",
                    "categoryparent"."id"
                ORDER BY
                    ${input.sort == 0 ?
                            Prisma.sql`"rating" DESC,`
                        :
                            Prisma.empty
                    }
                    ${input.sort == 1 ? 
                            Prisma.sql`"Mod"."totalViews" DESC,`
                        :
                            Prisma.empty
                    }
                    ${input.sort == 2 ?
                            Prisma.sql`"Mod"."totalDownloads" DESC,`
                        :
                            Prisma.empty
                    }
                    ${input.sort == 3 ?
                            Prisma.sql`"Mod"."editAt" DESC,`
                        :
                            Prisma.empty
                    }
                    ${input.sort == 4 ?
                            Prisma.sql`"Mod"."createAt" DESC,`
                        :
                            Prisma.empty
                    }
                    "Mod"."id" DESC
                LIMIT ${count + 1}
            `;

            // The below will work for SQLite, but doesn't support retrieving/ordering by the mod's real rating hence why we needed a raw Prisma query above.
            /*
            const items = await ctx.prisma.mod.findMany({
                where: {
                    ...(cats_arr && cats_arr.length > 0 && {
                        categoryId: {
                            in: cats_arr
                        }
                    }),
                    ...(input.visible && {
                        visible: input.visible
                    }),
                    ...(input.search && {
                        OR: [
                            {
                                name: {
                                    contains: input.search,
                                    mode: "insensitive"
                                }
                            },
                            {
                                descriptionShort: {
                                    contains: input.search,
                                    mode: "insensitive"
                                }
                            },
                            {
                                ownerName: {
                                    contains: input.search,
                                    mode: "insensitive"
                                }
                            },
                            {
                                category: {
                                    name: {
                                        contains: input.search,
                                        mode: "insensitive"
                                    },
                                    nameShort: {
                                        contains: input.search,
                                        mode: "insensitive"
                                    }
                                }
                            }
                        ]
                    })
                },
                select: {
                    id: true,
                    url: true,
                    ownerName: true,
                    name: true,
                    description: true,
                    descriptionShort: true,
                    install: true,

                    banner: true,

                    updateAt: true,
                    createAt: true,
                    editAt: true,
                    needsRecounting: false,

                    totalDownloads: true,
                    totalViews: true,

                    owner: true,
                    category: {
                        include: {
                            parent: true
                        }
                    },

                    ModSource: {
                        include: {
                            source: true
                        }
                    },
                    ModDownload: true,
                    ModScreenshot: true,
                    ModInstaller: {
                        include: {
                            source: true
                        }
                    },
                    ModRating: {
                        where: {
                            userId: ctx.session?.user?.id ?? ""
                        }
                    }
                },
                orderBy: [
                    {
                        ...(input.sort > 0 && {
                            ...(input.sort == 1 && { totalViews: "desc" }),
                            ...(input.sort == 2 && { totalDownloads: "desc" }),
                            ...(input.sort == 3 && { editAt: "desc" }),
                            ...(input.sort == 4 && { createAt: "desc" })
                        })
                    },
                    {
                        id: "desc"
                    }
                ],
                cursor: (input.cursor) ? { id: input.cursor } : undefined,
                take: count + 1
            });
            */

            let next_cur: typeof input.cursor | undefined = undefined;

            if (items.length > count) {
                const nextItem = items.pop();
                next_cur = nextItem?.id;
            }
            
            return {
                items,
                next_cur
            };
        }),
    requireUpdate: protectedProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            await ctx.prisma.mod.update({
                where: {
                    id: input.id
                },
                data: {
                    needsRecounting: true
                }
            })
        })
});
