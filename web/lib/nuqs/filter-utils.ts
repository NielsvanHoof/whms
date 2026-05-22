/** True when draft filter values differ from what is applied in the URL. */
export function filtersAreDirty<T extends Record<string, string>>(
	applied: T,
	draft: T,
): boolean {
	return (Object.keys(applied) as (keyof T)[]).some(
		(key) => applied[key] !== draft[key],
	);
}

import {
	DEFAULT_LIST_PER_PAGE,
	type ListPaginationQuery,
	normalizeListPerPage,
} from "@/lib/api/list-query-params";

/** Merges Laravel pagination params into an index query when non-default. */
export function withPaginationParams<T extends Record<string, unknown>>(
	query: T | undefined,
	pagination: { page: number; perPage: number },
): T & ListPaginationQuery {
	const base = query ?? ({} as T);
	const perPage = normalizeListPerPage(pagination.perPage);
	const result: Record<string, unknown> = { ...base };

	if (pagination.page > 1) {
		result.page = pagination.page;
	}
	if (perPage !== DEFAULT_LIST_PER_PAGE) {
		result.per_page = perPage;
	}

	return result as T & ListPaginationQuery;
}

/** @deprecated Use `withPaginationParams` */
export function withPageParam<T extends Record<string, unknown>>(
	query: T | undefined,
	page: number,
): T & { page?: number } {
	return withPaginationParams(query, { page, perPage: DEFAULT_LIST_PER_PAGE });
}
