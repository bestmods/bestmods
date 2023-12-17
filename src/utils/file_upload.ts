import fs from "fs"
import { FileType } from "./file";

export function UploadFile (
    path: string,
    contents: string,
    allowedTypes?: string | string[],
    noAppendFileType?: boolean,
    prependUploadUrl?: boolean
): [boolean, string | null, string | null] {
    // Split by comma if there is any.
    contents = contents.split(",")?.[1] ?? contents;

    const fileType = FileType(contents);

    // Make sure we recongize file type.
    if (fileType == "unknown") {
        return [false, "File type is unknown.", null];
    }

    // Check if we only want to allow specific file types.
    if (allowedTypes) {
        if (!allowedTypes.includes(fileType))
            return [false, `File type '${fileType}' not allowed!`, null];
    }

    // See if we need to append file type.
    if (!noAppendFileType)
        path += `.${fileType}`;

    // Convert Base64 content.
    const buffer = Buffer.from(contents, 'base64');

    const uploadDir = process.env.UPLOADS_DIR ?? "";

    // Compile full path to return.
    let fullPath = path;

    // Check if we need to prepend upload URL.
    if (prependUploadUrl)
        fullPath = uploadDir + path;

    // Attempt to upload file.
    try {
        fs.writeFileSync(uploadDir + path, buffer);
    } catch (error) {
        console.error(`Full Upload File Path => ${uploadDir}${path}`);
        console.error(error);

        return [false, "Failed to upload file. Check console for errors!", uploadDir + path];
    }

    return [true, null, fullPath];
}