import { z } from "zod";
import { router, contributorProcedure } from "../trpc";

import fs from 'fs';

export const filesRouter = router({
    doesExist: contributorProcedure
        .input(z.object({
            path: z.string()
        }))
        .query(({ input }) => {
            let exists = false;

            if (fs.existsSync(process.env.PUBLIC_DIR + "/" + input.path))
                exists = true;

            return exists;
        })
});