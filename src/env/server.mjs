// @ts-check
/**
 * This file is included in `/next.config.mjs` which ensures the app isn't built with invalid env vars.
 * It has to be a `.mjs`-file to be imported there.
 */
import { serverSchema } from "./schema.mjs";
import { env as clientEnv, formatErrors } from "./client.mjs";

import cron from 'node-cron';

import fetch from 'isomorphic-unfetch';

const _serverEnv = serverSchema.safeParse(process.env);

if (!_serverEnv.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    ...formatErrors(_serverEnv.error.format()),
  );
  throw new Error("Invalid environment variables");
}

for (let key of Object.keys(_serverEnv.data)) {
  if (key.startsWith("NEXT_PUBLIC_")) {
    console.warn("❌ You are exposing a server-side env-variable:", key);

    throw new Error("You are exposing a server-side env-variable");
  }
}

/* Tasks */
const genRatingsTask = async () => {
  const url = _serverEnv.data.NEXTAUTH_URL + "/api/genratings";
  const authKey = _serverEnv.data.API_AUTH_KEY;

  if (url.length < 1)
    return;

  const req = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + authKey
    }
  });

  const status = req.status;

  if (status != 200) {
    console.error("Error generating ratings.");

    const body = await req.json();
    
    console.error(body);
  }
}

// Schedule and generate task.
cron.schedule("*/5 * * * * *", genRatingsTask);
genRatingsTask();

export const env = { ..._serverEnv.data, ...clientEnv };
