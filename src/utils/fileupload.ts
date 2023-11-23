import fs from "fs"
import { FileType } from "./file";

export function UploadFile (
    path: string,
    contents: string,
    allowed_types?: string | string[],
    no_append_file_type?: boolean,
    prepend_upload_url?: boolean
): [boolean, string | null, string | null] {
    // Split by comma if there is any.
    contents = contents.split(",")?.[1] ?? contents;

    const file_type = FileType(contents);

    // Make sure we recongize file type.
    if (file_type == "unknown") {
        return [false, "File type is unknown.", null];
    }

    // Check if we only want to allow specific file types.
    if (allowed_types) {
        if (!allowed_types.includes(file_type))
            return [false, `File type '${file_type}' not allowed!`, null];
    }

    // See if we need to append file type.
    if (!no_append_file_type)
        path += `.${file_type}`;

    // Convert Base64 content.
    const buffer = Buffer.from(contents, 'base64');

    // Attempt to upload file.
    try {
        fs.writeFileSync((process.env.UPLOADS_DIR ?? "") + path, buffer);
    } catch (error) {
        console.error(`Full Upload File Path => ${process.env.UPLOADS_DIR ?? ""}${path}`);
        console.error(error);

        return [false, "Failed to upload file. Check console for errors!", (process.env.UPLOADS_DIR ?? "") + path];
    }

    // Compile full path to return.
    let full_path = path;

    // Check if we need to prepend upload URL.
    if (prepend_upload_url)
        full_path = path;

    return [true, null, full_path];
}