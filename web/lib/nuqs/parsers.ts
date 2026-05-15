import { parseAsString } from "nuqs";

/** Optional text filter: empty string in state, omitted from the URL when cleared. */
export const parseAsOptionalString = parseAsString.withDefault("");

/** Sort select: `__default__` in UI, omitted from the URL via `null` on apply/reset. */
export const parseAsSelectSort = parseAsString.withDefault("__default__");

/** Movement kind filter: `__all__` in UI, omitted from the URL via `null` on apply/reset. */
export const parseAsAllKindFilter = parseAsString.withDefault("__all__");
