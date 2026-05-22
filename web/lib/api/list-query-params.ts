export const DEFAULT_LIST_PER_PAGE = 15;

export const LIST_PER_PAGE_OPTIONS = [15, 25, 50, 100] as const;

export type ListPerPage = (typeof LIST_PER_PAGE_OPTIONS)[number];

export type ListPaginationQuery = {
	page?: number;
	per_page?: number;
};

/** @deprecated Use `ListPaginationQuery` */
export type ListPageQuery = ListPaginationQuery;

export function normalizeListPerPage(perPage: number): ListPerPage {
	return (LIST_PER_PAGE_OPTIONS as readonly number[]).includes(perPage)
		? (perPage as ListPerPage)
		: DEFAULT_LIST_PER_PAGE;
}

/** Appends Laravel pagination query params when they differ from defaults. */
export function appendListPagination(
	searchParams: URLSearchParams,
	query: ListPaginationQuery | undefined,
): void {
	if (query?.page && query.page > 1) {
		searchParams.set("page", String(query.page));
	}
	const perPage = normalizeListPerPage(
		query?.per_page ?? DEFAULT_LIST_PER_PAGE,
	);
	if (perPage !== DEFAULT_LIST_PER_PAGE) {
		searchParams.set("per_page", String(perPage));
	}
}

/** @deprecated Use `appendListPagination` */
export const appendListPage = appendListPagination;
