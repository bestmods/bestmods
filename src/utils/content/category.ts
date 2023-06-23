import { Category } from "@prisma/client";

import FileType from '../base64';
import fs from 'fs';

export const Insert_Or_Update_Category = async (
    prisma: any,

    name?: string,
    name_short?: string,
    url?: string,
    
    lookup_id?: number,

    icon?: string,
    iremove?: boolean,
    
    parent_id?: number | null,
    classes?: string | null,
    has_bg?: boolean

): Promise<[Category | null, boolean, string | null | any]> => {
    // Returns.
    let cat: Category | null = null;
    let success: boolean = true;
    let err: string | null | any = null;

    // Make sure we have text in required fields.
    if (!lookup_id && (!name || name.length < 1 || !name_short || name_short.length < 1 || !url || url.length < 1)) {
        err = "URL is empty.";
        success = false;

        if (!name || name.length < 1)
            err = "Name is empty.";

        if (!name_short || name_short.length < 1)
            err = "Short name is empty.";

        return [cat, success, err]
    }

    // We must insert/update our category first.
    try {
        cat = await prisma.category.upsert({
            where: {
                id: lookup_id ?? 0
            },
            update: {
                ...(parent_id != undefined && {
                    parentId: parent_id
                }),
                ...(name && {
                    name: name
                }),
                ...(name_short && {
                    nameShort: name_short
                }),
                ...(url && {
                    url: url
                }),
                ...(classes && {
                    classes: classes ?? null,
                }),
                ...(has_bg && {
                    hasBg: has_bg
                })
            },
            create: {
                parentId: parent_id || null,
                name: name,
                nameShort: name_short,
                url: url,
                ...(classes && {
                    classes: classes
                }),
                ...(has_bg && {
                    hasBg: has_bg
                })
            }
        });
    } catch (error) {
        err = error;
        success = false;

        return [cat, success, err];
    }

    if (!cat) {
        err = "Category is null.";
        success = false;

        return [cat, success, err];
    }
    // Let's now handle file uploads.
    let icon_path = null;

    if (icon != null && icon.length > 0) {
        const base64Data = icon.split(',')[1];

        if (base64Data != null) {
            // Retrieve file type.
            const file_ext = FileType(base64Data);

            // Make sure we don't have an unknown file type.
            if (file_ext != "unknown") {
                // Now let's compile our file name.
                const fileName = cat.id + "." + file_ext;

                // Set icon path.
                icon_path = "/images/category/" + fileName;

                // Convert to binary from base64.
                const buffer = Buffer.from(base64Data, 'base64');

                // Write file to disk.
                try {
                    fs.writeFileSync(process.env.UPLOADS_DIR + "/" + icon_path, buffer);
                } catch (error) {
                    err = error;
                    success = false;
                    
                    return [cat, success, err];
                }
            } else {
                err = "Icon's file extension is unknown.";
                success = false;

                return [err, success, err];
            }
        } else {
            err = "Parsing base64 data is null.";
            success = false;

            return [cat, success, err];
        }
    }

    // If we have a file upload, update database.
    if (icon_path != null || iremove) {
        // If we're removing the icon or banner, make sure our data is null before updating again.
        if (iremove)
            icon_path = null;

        try {
            await prisma.category.update({
                where: {
                    id: cat.id
                },
                data: {
                    icon: icon_path
                }
            })
        } catch (error) {
            err = error;
            success = false;

            return [cat, success, err];
        }
    }
   
    return [cat, success, err];
}