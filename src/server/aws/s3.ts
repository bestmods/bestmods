import { S3 } from "@aws-sdk/client-s3";
import { env } from "@env/server.mjs";

export let s3: S3 | undefined = undefined;

// Check if S3 is enabled.
if (env.S3_REGION && env.S3_BUCKET && env.S3_ACCESS_KEY && env.S3_ACCESS_SECRET) {
    s3 = new S3({
        region: env.S3_REGION,
        credentials: {
            accessKeyId: env.S3_ACCESS_KEY,
            secretAccessKey: env.S3_ACCESS_SECRET
        }
    })
}