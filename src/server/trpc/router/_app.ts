import { router } from "../trpc";
import { authRouter } from "./auth";
import { modsRouter } from "./mods";

export const appRouter = router({
  mods: modsRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
