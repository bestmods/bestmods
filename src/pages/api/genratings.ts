import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../server/db/client";

const genRatings = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method;

  if (method != "GET")
    return res.status(405).json({code: 405, message: "Method not allowed."});

  const authHeaderVal = req.headers.authorization ?? "";
  const authKey = "Bearer " + process.env.API_AUTH_KEY;

  if (authHeaderVal != authKey)
    return res.status(401).json({code: 404, message: "Unauthorized."});

  let updates = 0;
  const limit = Number(req.query["limit"] ?? 45);

  let hour: number | null = null;
  let day: number | null = null;
  let week: number | null = null;
  let month: number | null = null;
  let year: number | null = null;
  let alltime: number | null = null;

  // Could probably make type integer for better perf, but not a big deal making it a string for readability.
  const intervals: Array<{type: string, dateBack: number | null}> = [
    {type: "hour", dateBack: 360},
    {type: "day", dateBack: 86400},
    {type: "week", dateBack: 604800},
    {type: "month", dateBack: 592000},
    {type: "year", dateBack: 31536000},
    {type: "alltime", dateBack: null}
  ];

  const mods = await prisma.mod.findMany({
    orderBy: {
      lastUpdate: "asc"
    },
    take: limit
  });

  mods.map(async (mod) => {
    intervals.map(async (i) => {
      const dateAfter = (i.dateBack != null) ? new Date((Math.floor(Date.now() / 1000) - i.dateBack) * 1000) : null;

      let positives = 0;
      let negatives = 0;

      // Retrieve mod ratings.
      const ratings = await prisma.modRating.findMany({
        where: {
          modId: mod.id,
          ...(dateAfter != null && {
            createdAt: {
              lte: dateAfter
            }
          })
        }
      });

      // Loop through each rating and decide whether upvote or downvote.
      ratings.map((rating) => {
        if (rating.positive)
          positives++;
        else
          negatives++;
      });

      const rating = positives - negatives;

      // Now update mod with new values.
      switch(i.type) {
        case "hour":
          hour = rating;

          break;

        case "day":
          day = rating;

          break;

        case "week":
          week = rating;

          break;

        case "month":
          month = rating;
          
          break;

        case "year":
          year = rating;

          break;

        default:
          alltime = rating;
      }
    });

    // Update mod.
    const update = await prisma.mod.update({
      where: {
        id: mod.id
      },

      data: {
        lastUpdate: new Date(),
        ...(hour != null && {
          ratingHour: hour
        }),
        ...(day != null && {
          ratingDay: day
        }),
        ...(week != null && {
          ratingWeek: week
        }),
        ...(month != null && {
          ratingMonth: month
        }),
        ...(year != null && {
          ratingYear: year
        }),
        ...(alltime != null && {
          totalRating: alltime
        })
      }
    });

    if (update == null)
      console.error("Unable to update ratings on mod ID #" + mod.id);
    else
      updates++;
  });

  return res.status(200).json({code: 200, message: "Success!", updates: updates, limit: limit});
};

export default genRatings;
