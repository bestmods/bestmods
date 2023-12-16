import { type UserRole } from "@prisma/client";
import { CheckApiAccess } from "@utils/api";
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "@server/db/client";

export default async function Auth (req: NextApiRequest, res: NextApiResponse) {
    const key = process.env.API_AUTH_KEY ?? "";

    // Check if we have access.
    const [ret, err, method] = await CheckApiAccess({
        req: req,
        key: key,
        methods: ["POST"]
    })

    if (ret !== 200) {
        return res.status(ret).json({
            message: err
        });
    }

    // Retrieve user ID and role.
    const {
        userId,
        role
    } : {
        userId?: string
        role?: UserRole
    } = req.body;

    // Make sure user ID and role exists.
    if (!userId || !role) {
        return res.status(400).json({
            message: "User ID or role missing."
        });
    }

    // Check if we should update auth.
    if (method === "POST") {
        // Attempt to add role.
        try {
            await prisma.user.update({
                data: {
                    roles: {
                        push: role
                    }
                },
                where: {
                    id: userId
                }
            })
        } catch (error: unknown) {
            console.error(error);

            return res.status(400).json({
                message: `Error adding role '${role}' to user '${userId}'. Check the console!`
            })
        }

        return res.status(200).json({
            message: `Added '${role}' role to user '${userId}'!`
        })
    } else if (method === "DELETE") {
        // Retrieve current user.
        try {
            const user = await prisma.user.findFirstOrThrow({
                where: {
                    id: userId
                }
            });

            // Copy existing roles.
            const newRoles = user.roles;

            // Find role.
            const idx = newRoles.findIndex(tmp => tmp == role);

            if (idx !== -1)
                newRoles.splice(idx, 1);

            // Update user with new roles.
            await prisma.user.update({
                data: {
                    roles: {
                        set: newRoles
                    }
                },
                where: {
                    id: userId
                }
            })
        } catch (error: unknown) {
            console.error(error);

            return res.status(400).json({
                message: `Error removing role '${role}' from user '${userId}'. Check the console!`
            })
        }

        return res.status(200).json({
            message: `Removed '${role}' from user '${userId}'!`
        })
    }

    return res.status(405).json({
        message: "Bad method."
    })
}