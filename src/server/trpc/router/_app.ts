import { router } from "../trpc";
import { authRouter } from "./auth";

import  { categoryRouter } from './category';
import { sourceRouter } from "./source";
import { modRouter } from "./mod";

export const appRouter = router({
  source: sourceRouter,
  category: categoryRouter,
  mod: modRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
