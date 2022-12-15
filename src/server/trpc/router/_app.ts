import { router } from "../trpc";
import { authRouter } from "./auth";
import { publicRouter } from "./public";

export const appRouter = router({
  public: publicRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
