import fs from "fs"
import { FileType } from "./file";
import { type S3 } from "@aws-sdk/client-s3";
import { env } from "@env/server.mjs";

export async function UploadFile ({
    s3,
    path,
    contents,
    allowedTypes,
    noAppendFileType,
    prependUploadUrl
} : {
    s3?: S3
    path: string
    contents: string
    allowedTypes?: string | string[],
    noAppendFileType?: boolean
    prependUploadUrl?: boolean
}): Promise<[boolean, string | null, string | null]> {
    // Split by comma if there is any.
    contents = contents.split(",")?.[1] ?? contents;

    const fileType = FileType(contents);

    // Make sure we recongize file type.
    if (!fileType) {
        return [false, "File type is unknown.", null];
    }

    // Check if we only want to allow specific file types.
    if (allowedTypes) {
        if (!allowedTypes.includes(fileType))
            return [false, `File type '${fileType}' not allowed!`, null];
    }

    // Compile full path to return.
    let fullPath = path;

    // See if we need to append file type.
    if (!noAppendFileType)
        fullPath += `.${fileType}`;

    // Convert Base64 content.
    const buffer = Buffer.from(contents, 'base64');

    // Check for S3 support.
    if (s3) {
        // Make sure our full path doesn't start with a /.
        if (fullPath.startsWith("/"))
            fullPath = fullPath.slice(1);

        // Attempt to add object to our bucket.
        try {
            s3.putObject({
                Bucket: env.S3_BUCKET,
                ContentType: `image/${fileType}`,
                Body: buffer,
                Key: fullPath
            }, (err: unknown) => {
                if (err) {
                    console.error(err);

                    return [false, `Failed to add object to S3 bucket. Error => ${err}`, null]
                }
            })
        } catch (err: unknown) {
            console.error(err);

            return[false, "`FAILED TO ADD OBJECT!", null]
        }

        // Build our AWS path.
        fullPath = `https://${env.S3_BUCKET}.s3.amazonaws.com/${fullPath}`
    } else {
        // Make sure our full path starts with a forward slash.
        if (!fullPath.startsWith("/"))
            fullPath = `/${fullPath}`;

        const uploadDir = process.env.UPLOADS_DIR ?? "";

        if (prependUploadUrl)
            fullPath = `${uploadDir}${fullPath}`;

        // Attempt to upload file.
        try {
            fs.writeFileSync(uploadDir + fullPath, buffer);
        } catch (error) {
            console.error(`Full Upload File Path => ${uploadDir}${fullPath}`);
            console.error(error);

            return [false, "Failed to upload file. Check console for errors!", uploadDir + fullPath];
        }
    }

    return [true, null, fullPath];
}