import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

import { ModRowBrowser } from "types/mod"

import { prisma } from "@server/db/client";
import { Prisma } from "@prisma/client";

const DEFAULT_NUM_OF_MODS = 15;

const Test: React.FC<{
    mods: ModRowBrowser[]
}> = ({
    mods
}) => {
    console.log(mods);
    return (
        <>
            <h1>{mods.length} Mods Found!</h1>
            {mods.map((mod) => {
                return (
                    <div className="content-markdown bg-gray-950 text-white p-16" key={"mod-" + mod.id}>
                        <h1>Mod #{mod.id}</h1>
                        <p>{mod.name}</p>
                        <p>Rating - {mod.rating ?? 1}</p>
                        <h2>Category</h2>
                        <p>Parent Name - {mod?.category?.parent?.name ?? "N/A"}</p>
                        <p>Name - {mod?.category?.name ?? "N/A"}</p>
                        <h2>Downloads</h2>
                        {mod.ModDownload?.map((dl) => {
                            return (
                                <div key={"mod-" + mod.id + "-dl-" + dl?.url}>
                                    <p>Name - {dl?.name ?? "N/A"}</p>
                                    <p>URL - {dl?.url ?? "N/A"}</p>
                                </div>
                            );
                        })}
                        <h2>Sources</h2>
                        {mod.ModSource?.map((src) => {
                            return (
                                <div key={"mod-" + mod.id + "-src-" + src?.sourceUrl}>
                                    <p>Name - {src.source?.name ?? "N/A"}</p>
                                    <p>URL - {src?.sourceUrl ?? "N/A"}</p>
                                    <p>Query - {src?.query ?? "N/A"}</p>
                                </div>
                            );
                        })}
                        <h2>Installers</h2>
                        {mod.ModInstaller?.map((ins) => {
                            return (
                                <div key={"mod-" + mod.id + "-ins-" + ins?.sourceUrl}>
                                    <p>Name - {ins?.source?.name ?? "N/A"}</p>
                                    <p>URL - {ins?.sourceUrl ?? "N/A"}</p>
                                    <p>URL - {ins?.url ?? "N/A"}</p>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { query } = ctx;

    const cursor = query?.cursor;
    const count = query.count ? Number(query.count) + 1 : DEFAULT_NUM_OF_MODS + 1; 
    const sort = query.sort ? Number(query.sort) : 0;
    const timeframe = query.timeframe ? Number(query.timeframe) : 0;
    const search = query?.search;
    const visible = query.visible ? Boolean(Number(query.visible)) : undefined;

    const session = await getSession(ctx);

    const cats = query?.cats;

    console.log("Sort => " + sort);
    console.log("Timeframe => " + timeframe);
    console.log("Search => " + search);
    console.log("Cats => " + cats);
    console.log("Visible => " + visible);

    // Handle time frame.
    let time_range: number | undefined = undefined;

    switch (timeframe) {
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

    if (time_range)
        time_range_date = new Date(Date.now() - (time_range * 1000));

    // Handle categories.
    const cats_arr: number[] = [];
    
    if (cats) {
        cats.toString().split(",").map((cat) => {
            cats_arr.push(Number(cat));
        })
    }

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
                                'url', "subquery"."sourceUrl"
                            )
                        ELSE
                            NULL
                    END
                )) AS "ModSource"
                FROM (
                    SELECT DISTINCT ON ("ModSource"."sourceUrl")
                        "ModSource"."sourceUrl",
                        "ModSource"."query",
                        "modsourcesource"."name" AS "sourceName"
                    FROM "ModSource"
                    LEFT JOIN
                        "Source" 
                        AS "modsourcesource"
                        ON "ModSource"."sourceUrl" = "modsourcesource"."url"
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
                                'url', "subquery"."sourceUrl"
                            )
                        ELSE
                            NULL
                    END
                )) AS "ModInstaller"
                FROM (
                    SELECT DISTINCT ON ("ModInstaller"."sourceUrl")
                        "ModInstaller"."sourceUrl",
                        "ModInstaller"."url",
                        "modinstallersource"."name" AS "sourceName"
                    FROM
                        "ModInstaller"
                    LEFT JOIN
                        "Source"
                        AS "modinstallersource"
                        ON "ModInstaller"."sourceUrl" = "modinstallersource"."url"
                    WHERE
                        "Mod"."id" = "ModInstaller"."modId"
                ) AS "subquery"
            ) AS "ModInstaller",
            json_agg(DISTINCT "ModRating".*) AS "ModRating"
        FROM 
            "Mod"
        LEFT JOIN 
            "Category"
            AS "category"
            ON "Mod"."categoryId" = "category"."id"
        LEFT JOIN
            "Category"
            AS "categoryparent"
            ON "category"."parentId" = "categoryparent"."id"
        LEFT JOIN
            "ModDownload"
            ON "Mod"."id" = "ModDownload"."modId"
        LEFT JOIN
            "ModSource"
            ON "Mod"."id" = "ModSource"."modId"
        LEFT JOIN
            "ModInstaller"
            ON "Mod"."id" = "ModInstaller"."modId"
        LEFT JOIN
            "ModRating"
            ON "Mod"."id" = "ModRating"."modId" AND "ModRating"."userId" = ${session?.user?.id ?? ""}
        ${(cats_arr.length > 0 || visible != undefined || search) ?
                Prisma.sql`WHERE
                    ${cats_arr.length > 0 ?
                            Prisma.sql`"Mod"."categoryId" IN (${Prisma.join(cats_arr)}) ${(visible != undefined || search) ? Prisma.sql`AND` : Prisma.empty}`
                        :
                            Prisma.empty
                    }
                    ${visible != undefined ?
                            Prisma.sql`"Mod"."visible" = ${visible} ${search ? Prisma.sql`AND` : Prisma.empty}`
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
                            )`
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
    
    return {
        props: {
            mods: JSON.parse(JSON.stringify(mods, (_, v) => typeof v === 'bigint' ? v.toString() : v))
        }
    };
}

export default Test;