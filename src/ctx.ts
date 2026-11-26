import { createContext, useContext } from "react";
import type { Bi, Key, Lang } from "./i18n";

export type Ctx = { lang: Lang; t: (k: Key) => string; tx: (o: Bi) => string; speak: (s: string) => void };
export const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);
