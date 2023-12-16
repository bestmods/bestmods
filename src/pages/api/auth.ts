import { CheckApiAccess } from "@utils/api";
import { type NextApiRequest, type NextApiResponse } from "next";

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

    // Check if we should update auth.
    if (method === "POST") {
        const {
            userId,
            role
        } : {
            userId?: string
            role?: number
        } = req.body;

        
    }

}