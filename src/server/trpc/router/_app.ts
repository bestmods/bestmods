import { router } from "../trpc";
import { authRouter } from "./auth";

import { categoryRouter } from './category';
import { sourceRouter } from "./source";
import { modRouter } from "./mod";
import { modRatingRouter } from './mod_rating';
import { modDownloadRouter } from './mod_download';
import { permissionRouter } from "./permission";
import { userRouter } from "./user";

export const appRouter = router({
    source: sourceRouter,
    category: categoryRouter,
    mod: modRouter,
    modRating: modRatingRouter,
    modDownload: modDownloadRouter,
    auth: authRouter,
    permission: permissionRouter,
    user: userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
