import { type ModCredit, type Mod, type ModDownload, type ModInstaller, type ModScreenshot, type ModSource, type PrismaClient } from "@prisma/client";

import { UploadFile } from "@utils/file_upload";
import { ModRowBrowser } from "~/types/mod";

import { prisma } from "@server/db/client";
import { Prisma } from "@prisma/client";

export async function GetMods ({
    isStatic = true,
    limit = 10,
    cursor,
    ratingTimeRange,
    userId,
    categories = [],
    search,
    visible,
    sort = 0
} : {
    isStatic?: boolean
    limit?: number
    cursor?: number | null
    ratingTimeRange?: Date
    userId?: string
    categories?: number[]
    search?: string
    visible?: boolean
    sort?: number
}): Promise<[ModRowBrowser[], number | undefined]> {
    // Retrieve cursor item.
    let cursorItem: ModRowBrowser | undefined = undefined;
    let cursorItemEditAt: Date | undefined = undefined;
    let cursorItemCreatedAt: Date | undefined = undefined;

    if (!isStatic && cursor) {
        const cursorItems = await prisma.$queryRaw<ModRowBrowser[]>`
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
                            ${ratingTimeRange ?
                                    Prisma.sql`AND "ModRating"."createdAt" > ${ratingTimeRange}`
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
                            ${ratingTimeRange ?
                                    Prisma.sql`AND "ModRating"."createdAt" > ${ratingTimeRange}`
                                :
                                    Prisma.empty
                            }
                    )
                ) + 1 AS "rating"
            FROM
                "Mod"
            WHERE
                "Mod"."id" = ${cursor}
        `;

        cursorItem = cursorItems?.[0];

        if (cursorItem) {
            cursorItemEditAt = new Date(
                cursorItem.editAt.getUTCFullYear(),
                cursorItem.editAt.getUTCMonth(),
                cursorItem.editAt.getUTCDate(),
                cursorItem.editAt.getUTCHours(),
                cursorItem.editAt.getUTCMinutes(),
                cursorItem.editAt.getUTCSeconds(),
                cursorItem.editAt.getUTCMilliseconds()
            );

            cursorItemCreatedAt = new Date(
                cursorItem.createAt.getUTCFullYear(),
                cursorItem.createAt.getUTCMonth(),
                cursorItem.createAt.getUTCDate(),
                cursorItem.createAt.getUTCHours(),
                cursorItem.createAt.getUTCMinutes(),
                cursorItem.createAt.getUTCSeconds(),
                cursorItem.createAt.getUTCMilliseconds()
            );
        }
    }

    let count = limit;

    if (!isStatic)
        count++;

    const hasWhere = categories.length > 0 || visible !== undefined || search || cursorItem;

    const mods = await prisma.$queryRaw<ModRowBrowser[]>` 
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
                        ${ratingTimeRange ?
                                Prisma.sql`AND "ModRating"."createdAt" > ${ratingTimeRange}`
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
                        ${ratingTimeRange ?
                                Prisma.sql`AND "ModRating"."createdAt" > ${ratingTimeRange}`
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
                    "ModRating"."userId" = ${userId ?? ""}
        ${hasWhere ? 
            Prisma.sql`WHERE
                ${categories.length > 0 ?
                        Prisma.sql`"Mod"."categoryId" IN (${Prisma.join(categories)}) ${(visible != undefined || search || cursor) ? Prisma.sql`AND` : Prisma.empty}`
                    :
                        Prisma.empty
                }
                ${visible !== undefined ?
                        Prisma.sql`"Mod"."visible" = ${visible} ${(search || cursor) ? Prisma.sql`AND` : Prisma.empty}`
                    :
                        Prisma.empty
                }
                ${search ?
                        Prisma.sql`(
                            "Mod"."name" ILIKE ${"%" + search + "%"} OR
                            "Mod"."descriptionShort" ILIKE ${"%" + search + "%"} OR
                            "Mod"."ownerName" ILIKE ${"%" + search + "%"} OR
                            "category"."name" ILIKE ${"%" + search + "%"} OR
                            "category"."nameShort" ILIKE ${"%" + search + "%"}
                        ) ${cursor ? Prisma.sql`AND` : Prisma.empty}`
                    :
                        Prisma.empty
                }
                ${cursorItem ?
                        Prisma.sql`
                            (
                                (
                                    ${sort == 0 ?
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
                                                    ${ratingTimeRange ?
                                                            Prisma.sql`AND "ModRating"."createdAt" > ${ratingTimeRange}`
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
                                                    ${ratingTimeRange ?
                                                            Prisma.sql`AND "ModRating"."createdAt" > ${ratingTimeRange}`
                                                        :
                                                            Prisma.empty
                                                    }
                                            ) + 1 = ${cursorItem.rating}`
                                        :
                                            Prisma.empty
                                    }
                                    ${sort == 1 ?
                                            Prisma.sql`"Mod"."totalViews" = ${cursorItem.totalViews}`
                                        :
                                            Prisma.empty
                                    }
                                    ${sort == 2 ?
                                            Prisma.sql`"Mod"."totalDownloads" = ${cursorItem.totalDownloads}`
                                        :
                                            Prisma.empty
                                    }
                                    ${sort == 3 && cursorItemEditAt ?
                                            Prisma.sql`"Mod"."editAt" = ${cursorItemEditAt}`
                                        :
                                            Prisma.empty
                                    }
                                    ${sort == 4 && cursorItemCreatedAt ?
                                            Prisma.sql`"Mod"."createAt" = ${cursorItemCreatedAt}`
                                        :
                                            Prisma.empty
                                    }
                                    AND
                                        "Mod"."id" <= ${cursorItem.id}
                                )
                                OR
                                (
                                    ${sort == 0 ?
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
                                                        ${ratingTimeRange ?
                                                                Prisma.sql`AND "ModRating"."createdAt" > ${ratingTimeRange}`
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
                                                        ${ratingTimeRange ?
                                                                Prisma.sql`AND "ModRating"."createdAt" > ${ratingTimeRange}`
                                                            :
                                                                Prisma.empty
                                                        }
                                                ) + 1 < ${cursorItem.rating}`
                                        :
                                            Prisma.empty
                                    }
                                    ${sort == 1 ?
                                            Prisma.sql`"Mod"."totalViews" < ${cursorItem.totalViews}`
                                        :
                                            Prisma.empty
                                    }
                                    ${sort == 2 ?
                                            Prisma.sql`"Mod"."totalDownloads" < ${cursorItem.totalDownloads}`
                                        :
                                            Prisma.empty
                                    }
                                    ${sort == 3 && cursorItemEditAt ?
                                            Prisma.sql`"Mod"."editAt" < ${cursorItemEditAt}`
                                        :
                                            Prisma.empty
                                    }
                                    ${sort == 4 && cursorItemCreatedAt ?
                                            Prisma.sql`"Mod"."createAt" < ${cursorItemCreatedAt}`
                                        :
                                            Prisma.empty
                                    }
                                )
                            )
                        `
                    :
                        Prisma.empty
                }
            `
        :
            Prisma.empty
        }
        GROUP BY
            "Mod"."id",
            "category"."id",
            "categoryparent"."id"
        ORDER BY
            ${sort == 0 ?
                    Prisma.sql`"rating" DESC,`
                :
                    Prisma.empty
            }
            ${sort == 1 ? 
                    Prisma.sql`"Mod"."totalViews" DESC,`
                :
                    Prisma.empty
            }
            ${sort == 2 ?
                    Prisma.sql`"Mod"."totalDownloads" DESC,`
                :
                    Prisma.empty
            }
            ${sort == 3 ?
                    Prisma.sql`"Mod"."editAt" DESC,`
                :
                    Prisma.empty
            }
            ${sort == 4 ?
                    Prisma.sql`"Mod"."createAt" DESC,`
                :
                    Prisma.empty
            }
            "Mod"."id" DESC
        LIMIT ${count}
    `;


    // Retrieve next mod if any.
    let nextMod: number | undefined = undefined;

    if (!isStatic && mods.length > limit) {
        const next = mods.pop();
        nextMod = next?.id;
    }

    return [mods, nextMod];
}

export async function InsertOrUpdateMod ({
    prisma,

    lookupId,

    ownerId,
    ownerName,

    categoryId,

    name,
    url,
    description,
    descriptionShort,
    install,
    visible,

    banner,
    bremove,

    downloads = [],
    screenshots = [],
    sources = [],
    installers = [],
    credits = []
} : {
    prisma: PrismaClient

    lookupId?: number

    ownerId?: string,
    ownerName?: string

    categoryId?: number | null

    name?: string
    url?: string
    description?: string
    descriptionShort?: string
    install?: string
    visible?: boolean

    banner?: string
    bremove?: boolean

    downloads?: ModDownload[]
    screenshots?: ModScreenshot[]
    sources?: ModSource[]
    installers?: ModInstaller[]
    credits?: ModCredit[]
}): Promise<[Mod | null, boolean, string | null | unknown]> {
    // Returns.
    let mod: Mod | null = null;

    // Make sure we have text in required fields.
    if (!lookupId && (!url || url.length < 1 || !name || name.length < 1 || !description || description.length < 1)) {
        let err = "URL is empty.";

        if (!name || name.length < 1)
            err = "Name is empty.";

        if (!description || description.length < 1)
            err = "Description is empty.";

        return [mod, false, err]
    }

    // Let's now handle file uploads.
    let bannerPath: string | boolean | null = false;

    if (bremove)
    bannerPath = null;

    if (!bremove && (banner && banner.length > 0)) {
        const path = `/images/mod/${url}`

        const [success, err, fullPath] = UploadFile(path, banner);

        if (!success || !fullPath)
            return [null, false, err];
        
        bannerPath = fullPath;
    }

    try {
        if (lookupId) {
            mod = await prisma.mod.update({
                where: {
                    id: lookupId
                },
                data: {
                    editAt: new Date(Date.now()),
                    ...(visible !== undefined && {
                        visible: visible
                    }),
                    ...(ownerName && ownerName.length > 0 && {
                        ownerName: ownerName
                    }),
                    ...(ownerId && {
                        ownerId: ownerId
                    }),
                    ...(name && {
                        name: name
                    }),
                    ...(url && {
                        url: url
                    }),
                    ...(categoryId !== undefined && {
                        categoryId: categoryId
                    }),
                    ...(description && {
                        description: description
                    }),
                    ...(descriptionShort && {
                        descriptionShort: descriptionShort
                    }),
                    ...(install && {
                        install: install
                    }),
                    ...(bannerPath !== false && {
                        banner: bannerPath
                    }),
                    ModDownload: {
                        deleteMany: {
                            modId: lookupId
                        },
                        create: downloads.map((download) => ({
                            name: download.name,
                            url: download.url
                        }))
                    },
                    ModSource: {
                        deleteMany: {
                            modId: lookupId
                        },
                        create: sources.map((source) => ({
                            sourceUrl: source.sourceUrl,
                            query: source.query,
                            primary: source.primary
                        }))
                    },
                    ModInstaller: {
                        deleteMany: {
                            modId: lookupId
                        },
                        create: installers.map((installer) => ({
                            sourceUrl: installer.sourceUrl,
                            url: installer.url
                        }))
                    },
                    ModScreenshot: {
                        deleteMany: {
                            modId: lookupId
                        },
                        create: screenshots.map((screenshot) => ({
                            url: screenshot.url
                        }))
                    },
                    ModCredit: {
                        deleteMany: {
                            modId: lookupId
                        },
                        create: credits.map((credit) => ({
                            name: credit.name,
                            credit: credit.credit,
                            userId: credit.userId
                        }))
                    }
                }
            });
        } else {
            mod = await prisma.mod.create({
                data: {
                    visible: visible,
                    ownerName: ownerName,
                    ownerId: ownerId,

                    name: name ?? "",
                    url: url ?? "",
                    categoryId: categoryId,

                    description: description ?? "",
                    descriptionShort: descriptionShort,
                    install: install,

                    ...(bannerPath !== false && {
                        banner: bannerPath
                    }),
                    ModDownload: {
                        create: downloads.map((download) => ({
                            name: download.name,
                            url: download.url
                        }))
                    },
                    ModSource: {
                        create: sources.map((source) => ({
                            sourceUrl: source.sourceUrl,
                            query: source.query,
                            primary: source.primary
                        }))
                    },
                    ModInstaller: {
                        create: installers?.map((installer) => ({
                            sourceUrl: installer.sourceUrl,
                            url: installer.url
                        }))
                    },
                    ModScreenshot: {
                        create: screenshots.map((screenshot) => ({
                            url: screenshot.url
                        }))
                    },
                    ModCredit: {
                        create: credits.map((credit) => ({
                            name: credit.name,
                            credit: credit.credit,
                            userId: credit.userId
                        }))
                    }
                }
            });
        }
    } catch (error) {
        return [null, false, error];
    }

    if (mod == null)
        return [null, false, "Mod is null."];

    return [mod, true, null];
}

export async function DeleteMod ({
    prisma,
    id,
} : {
    prisma: PrismaClient
    id: number
}): Promise<[boolean, string | unknown | null]> {
    try {
        await prisma.mod.delete({
            where: {
                id: id
            }
        });
    } catch (error) {
        return [false, error];
    }

    return [true, null];
}

export async function GetModRating ({
    prisma,
    id,
    date
} : {
    prisma: PrismaClient,
    id: number,
    date?: Date
}): Promise<number> {
    const rating_pos = await prisma.modRating.count({
        where: {
            modId: id,
            positive: true,
            ...(date && {
                createdAt: {
                    gte: date
                }
            })
        }
    });

    const rating_neg = await prisma.modRating.count({
        where: {
            modId: id,
            positive: false,
            ...(date && {
                createdAt: {
                    gte: date
                }
            })
        }
    });

    return (rating_pos - rating_neg) + 1;
}

