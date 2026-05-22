import { parseAsInteger, parseAsString } from "nuqs";

/** Optional text filter: empty string in state, omitted from the URL when cleared. */
export const parseAsOptionalString = parseAsString.withDefault("");

/** Sort select: `__default__` in UI, omitted from the URL via `null` on apply/reset. */
export const parseAsSelectSort = parseAsString.withDefault("__default__");

/** Movement kind filter: `__all__` in UI, omitted from the URL via `null` on apply/reset. */
export const parseAsAllKindFilter = parseAsString.withDefault("__all__");

/** List page index: `1` in state, omitted from the URL on the first page. */
export const parseAsPage = parseAsInteger.withDefault(1);

/** Page size: `15` in state (API default), omitted from the URL at the default. */
export const parseAsPerPage = parseAsInteger.withDefault(15);
