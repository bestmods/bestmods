import { router } from "../trpc";
import { authRouter } from "./auth";

import  { categoryRouter } from './category';
import { sourceRouter } from "./source";
import { modRouter } from "./mod";
import { userRouter } from './user';
import { modRatingRouter } from './mod_rating';
import { modDownloadRouter } from './mod_download';

export const appRouter = router({
  source: sourceRouter,
  category: categoryRouter,
  mod: modRouter,
  modRating: modRatingRouter,
  modDownload: modDownloadRouter,
  auth: authRouter,
  user: userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
