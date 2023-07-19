import { router } from "@server/trpc/trpc";

import { authRouter } from "@server/trpc/router/auth";
import { categoryRouter } from "@server/trpc/router/category";
import { sourceRouter } from "@server/trpc/router/source";
import { modRouter } from "@server/trpc/router/mod";
import { modRatingRouter } from "@server/trpc/router/mod_rating";
import { modDownloadRouter } from "@server/trpc/router/mod_download";
import { permissionRouter } from "@server/trpc/router/permission";
import { userRouter } from "@server/trpc/router/user";

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
