import { type ModCredit, type Mod, type ModDownload, type ModInstaller, type ModScreenshot, type ModSource, type PrismaClient, type ModRequired } from "@prisma/client";

import { UploadFile } from "@utils/file_upload";
import { type ModRowBrowser } from "~/types/mod";

import { prisma } from "@server/db/client";
import { Prisma } from "@prisma/client";
import { type S3 } from "@aws-sdk/client-s3";

export async function GetMods ({
    isStatic = true,
    limit = 10,
    cursor,
    ratingTimeRange,
    userId,
    categories = [],
    search,
    visible,
    sort = 0,
    incVisibleColumn = false,
    incSources = true,
    incDownloads = true,
    incInstallers = true
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
    incVisibleColumn?: boolean
    incSources?: boolean
    incDownloads?: boolean
    incInstallers?: boolean
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
            "Mod"."id",
            "Mod"."url",
            "Mod"."name",
            "Mod"."ownerName",
            "Mod"."banner",
            ${incVisibleColumn ? (
                Prisma.sql`"Mod"."visible",`
            ) : Prisma.empty}
            "Mod"."descriptionShort",
            "Mod"."totalDownloads",
            "Mod"."totalViews",
            "Mod"."nsfw",
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
            ${incDownloads ?
                Prisma.sql`
                    json_agg(DISTINCT "ModDownload".*) AS "ModDownload",
                `
            : Prisma.empty}
            ${incSources ?
                Prisma.sql`
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
                `
            : Prisma.empty}
            ${incInstallers ? 
                Prisma.sql`
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
                `
            : Prisma.empty}
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
        ${incDownloads ?
            Prisma.sql`
                LEFT JOIN
                    "ModDownload"
                ON
                    "Mod"."id" = "ModDownload"."modId"
            `
        : Prisma.empty}
        ${incSources ?
            Prisma.sql`
                LEFT JOIN
                    "ModSource"
                ON
                    "Mod"."id" = "ModSource"."modId"
            `
        : Prisma.empty}
        ${incInstallers ?
            Prisma.sql`
                LEFT JOIN
                    "ModInstaller"
                ON 
                    "Mod"."id" = "ModInstaller"."modId"
            `
        : Prisma.empty}

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
    s3,

    lookupId,
    srcUrl,
    srcQuery,

    ownerId,
    ownerName,

    categoryId,

    name,
    url,
    description,
    descriptionShort,
    install,
    visible,
    version,

    nsfw,
    autoUpdate,

    banner,
    bremove,

    lastScanned,

    downloads,
    screenshots,
    sources,
    installers,
    credits,
    required
} : {
    prisma: PrismaClient
    s3?: S3

    lookupId?: number
    srcUrl?: string
    srcQuery?: string

    ownerId?: string,
    ownerName?: string

    categoryId?: number

    name?: string
    url?: string
    description?: string
    descriptionShort?: string | null
    install?: string | null
    version?: string | null

    visible?: boolean

    nsfw?: boolean
    autoUpdate?: boolean

    banner?: string
    bremove?: boolean

    lastScanned?: Date | null

    downloads?: ModDownload[]
    screenshots?: ModScreenshot[]
    sources?: ModSource[]
    installers?: ModInstaller[]
    credits?: ModCredit[]
    required?: ModRequired[]
}): Promise<[Mod | null, boolean, string | null | unknown]> {
    // Returns.
    let mod: Mod | null = null;

    // Remove duplicate screenshots.
    if (screenshots) {
        screenshots = screenshots.filter((val, index, array) => {
            return index === array.findIndex((o) => o.url === val.url)
        })
    }

    // Remove duplicate downloads.
    if (downloads) {
        downloads = downloads.filter((val, index, array) => {
            return index === array.findIndex((o) => o.url === val.url)
        })
    }

    // Remove duplicate sources.
    if (sources) {
        sources = sources.filter((val, index, array) => {
            return index === array.findIndex((o) => o.sourceUrl === val.sourceUrl && o.query === val.query)
        })
    }

    // Remove duplicate installers.
    if (installers) {
        installers = installers.filter((val, index, array) => {
            return index === array.findIndex((o) => o.sourceUrl === val.sourceUrl && o.url === val.url)
        })
    }

    // Remove duplicate required mdos.
    if (required) {
        required = required.filter((val, index, array) => {
            return index === array.findIndex((o) => o.sId === val.sId && o.dId === val.dId)
        })
    }

    try {
        if (lookupId) {
            mod = await prisma.mod.update({
                where: {
                    id: lookupId,
                    ...((srcUrl || srcQuery) && {
                        ModSource: {
                            some: {
                                sourceUrl: srcUrl,
                                query: srcQuery
                            }
                        }
                    })
                },
                data: {
                    editAt: new Date(Date.now()),
                    visible: visible,
                    ownerName: ownerName,
                    ownerId: ownerId,
                    name: name,
                    url: url,
                    categoryId: categoryId,
                    description: description,
                    descriptionShort: descriptionShort,
                    install: install,
                    version: version,
                    nsfw: nsfw,
                    autoUpdate: autoUpdate,
                    lastScanned: lastScanned,
                    ...(bremove && {
                        banner: null
                    }),
                    ...(typeof downloads !== "undefined" && {
                        ModDownload: {
                            deleteMany: {
                                modId: lookupId
                            },
                            createMany: {
                                data: downloads.map((dl) => ({
                                    name: dl.name,
                                    url: dl.url,
                                    size: dl.size,
                                    uploadDate: dl.uploadDate
                                }))
                            }
                        }
                    }),
                    ...(typeof sources !== "undefined" && {
                        ModSource: {
                            deleteMany: {
                                modId: lookupId
                            },
                            createMany: {
                                data: sources.map((src) => ({
                                    sourceUrl: src.sourceUrl,
                                    query: src.query,
                                    primary: src.primary
                                }))
                            }
                        },
                    }),
                    ...(typeof installers !== "undefined" && {
                        ModInstaller: {
                            deleteMany: {
                                modId: lookupId
                            },
                            createMany: {
                                data: installers.map((ins) => ({
                                    sourceUrl: ins.sourceUrl,
                                    url: ins.url
                                }))
                            }
                        },
                    }),
                    ...(typeof screenshots !== "undefined" && {
                        ModScreenshot: {
                            deleteMany: {
                                modId: lookupId
                            },
                            createMany: {
                                data: screenshots.map((ss) => ({
                                    url: ss.url
                                }))
                            }
                        },
                    }),
                    ...(typeof credits !== "undefined" && {
                        ModCredit: {
                            deleteMany: {
                                modId: lookupId
                            },
                            createMany: {
                                data: credits.map((cre) => ({
                                    name: cre.name,
                                    credit: cre.credit,
                                    userId: cre.userId
                                }))
                            }
                        }
                    }),
                    ...(typeof required !== "undefined" && {
                        requiredSrc: {
                            deleteMany: {
                                sId: lookupId
                            },
                            createMany: {
                                data: required.map((req) => ({
                                    dId: req.dId
                                }))
                            }
                        }
                    })
                }
            });
        } else {
            // Make sure certain values are filled before creating.
            if (!url)
                return [null, false, "URL is empty."]

            if (!name)
                return [null, false, "Name is empty."]

            if (!description)
                return [null, false, "Description is empty."]

            if (!categoryId)
                return [null, false, "No category ID present."]

            mod = await prisma.mod.create({
                data: {
                    visible: visible,
                    ownerName: ownerName,
                    ownerId: ownerId,
                    name: name,
                    url: url,
                    categoryId: categoryId,
                    description: description,
                    descriptionShort: descriptionShort,
                    install: install,
                    nsfw: nsfw,
                    autoUpdate,
                    version: version,
                    lastScanned: lastScanned,
                    ...(typeof downloads !== "undefined" && {
                        ModDownload: {
                            createMany: {
                                data: downloads.map((dl) => ({
                                    name: dl.name,
                                    url: dl.url,
                                    size: dl.size,
                                    uploadDate: dl.uploadDate
                                }))
                            }
                        }
                    }),
                    ...(typeof sources !== "undefined" && {
                        ModSource: {
                            createMany: {
                                data: sources.map((src) => ({
                                    sourceUrl: src.sourceUrl,
                                    query: src.query,
                                    primary: src.primary
                                }))
                            }
                        }
                    }),
                    ...(typeof installers !== "undefined" && {
                        ModInstaller: {
                            createMany: {
                                data: installers.map((ins) => ({
                                    sourceUrl: ins.sourceUrl,
                                    url: ins.url
                                }))
                            }
                        }
                    }),
                    ...(typeof screenshots !== "undefined" && {
                        ModScreenshot: {
                            createMany: {
                                data: screenshots.map((ss) => ({
                                    url: ss.url
                                }))
                            }
                        }
                    }),
                    ...(typeof credits !== "undefined" && {
                        ModCredit: {
                            createMany: {
                                data: credits.map((cre) => ({
                                    name: cre.name,
                                    credit: cre.credit,
                                    userId: cre.userId
                                }))
                            }
                        }
                    }),
                    ...(typeof required !== "undefined" && {
                        requiredSrc: {
                            createMany: {
                                data: required.map((req) => ({
                                    dId: req.dId
                                }))
                            }
                        }
                    })
                }
            });
        }

        // Handle banner.
        if (mod) {
            if (!bremove && (banner && banner.length > 0)) {
                const path = `images/mod/banner/${mod.id.toString()}`

                const [success, err, fullPath] = await UploadFile({
                    s3: s3,
                    path: path,
                    contents: banner
                });

                if (!success || !fullPath)
                    return [null, false, err];
                
                const bannerPath = fullPath;

                // Update mod with banner information.
                await prisma.mod.update({
                    data: {
                        banner: bannerPath
                    },
                    where: {
                        id: mod.id
                    }
                })
            }
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

