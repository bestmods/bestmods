import { User, type Category, type PrismaClient } from "@prisma/client";

import FileType from './base64';
import fs from 'fs';

export const Insert_Or_Update_User = async (
    prisma: PrismaClient,

    lookup_id: string,

    name?: string,
    email?: string,

    avatar?: string,
    aremove?: boolean
): Promise<[User | null, boolean, string | null | any]> => {
    // Returns.
    let user: User | null = null;

    // Let's now handle file uploads.
    let avatar_path: string | boolean | null = false;

    if (avatar != null && avatar.length > 0) {
        const base64Data = avatar.split(',')[1];

        if (base64Data != null) {
            // Retrieve file type.
            const file_ext = FileType(base64Data);

            // Make sure we don't have an unknown file type.
            if (file_ext != "unknown") {
                // Now let's compile our file name.
                const fileName =  lookup_id + "." + file_ext;

                // Set avatar path.
                avatar_path = "/images/users/" + fileName;

                // Convert to binary from base64.
                const buffer = Buffer.from(base64Data, 'base64');

                // Write file to disk.
                try {
                    fs.writeFileSync(process.env.UPLOADS_DIR + "/" + avatar_path, buffer);
                } catch (error) {                 
                    return [null, false, error];
                }
            } else {
                return [null, false, "Avatar's file extension is unknown."];
            }
        } else
            return [null, false, "Parsing base64 data is null."];
    } else if (aremove)
        avatar_path = null;

    // We must insert/update our category first.
    try {
        user = await prisma.user.update({
            where: {
                id: lookup_id
            },
            data: {
                ...(name && {
                    name: name
                }),
                ...(email && {
                    email: email
                }),
                ...(avatar_path !== false && {
                    avatar_path: avatar_path
                })
            }
        });
    
    } catch (error) {
        return [user, false, error];
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
            return [cat, false, error];
        }
    }
   
    return [cat, true, null];
}

export const Delete_Category = async (
    prisma: PrismaClient,
    id: number
): Promise<[boolean, string | any | null]> => {
    try {
        await prisma.category.delete({
            where: {
                id: id
            }
        });
    } catch (error) {
        return [false, error];
    }

    return [true, null];
}