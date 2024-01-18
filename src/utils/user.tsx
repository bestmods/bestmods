import { type User, type PrismaClient } from "@prisma/client";

import { UploadFile } from "./file_upload";
import { type S3 } from "@aws-sdk/client-s3";

export async function InsertOrUpdateUser ({
    prisma,
    s3,

    lookupId,

    name,
    email,

    avatar,
    aremove
} : {
    prisma: PrismaClient
    s3?: S3

    lookupId: string

    name?: string
    email?: string

    avatar?: string
    aremove?: boolean
}): Promise<[User | null, boolean, string | null | unknown]> {
    // Returns.
    let user: User | null = null;

    // Let's now handle file uploads.
    let avatarPath: string | boolean | null = false;

    if (avatar != null && avatar.length > 0) {
        const path = `images/users/avatar/${lookupId}`;

        const [success, err, fullPath] = await UploadFile({
            s3,
            path: path,
            contents: avatar
        });
        
        if (!success || !fullPath)
            return [user, false, err];

        avatarPath = fullPath;
    } else if (aremove)
        avatarPath = null;

    // We must insert/update our category first.
    try {
        user = await prisma.user.update({
            where: {
                id: lookupId
            },
            data: {
                ...(name && {
                    name: name
                }),
                ...(email && {
                    email: email
                }),
                ...(avatarPath !== false && {
                    image: avatarPath
                })
            }
        });
    
    } catch (error) {
        return [user, false, error];
    }

    return [user, true, null];
}

export async function DeleteUser ({
    prisma,
    id
} : {
    prisma: PrismaClient,
    id: string
}): Promise<[boolean, string | unknown | null]> {
    try {
        await prisma.user.delete({
            where: {
                id: id
            }
        });
    } catch (error) {
        return [false, error];
    }

    return [true, null];
}