"use client";

import { parseAsInteger, useQueryStates } from "nuqs";
import { useMemo } from "react";

import { useUserPreferences } from "@/hooks/use-user-preferences";
import {
	DEFAULT_LIST_PER_PAGE,
	normalizeListPerPage,
} from "@/lib/api/list-query-params";

import { parseAsPage } from "./parsers";

/** URL-backed list pagination (`?page=2&per_page=25`). */
export function useListPage() {
	const { preferences } = useUserPreferences();
	const listPageParsers = useMemo(
		() => ({
			page: parseAsPage,
			per_page: parseAsInteger.withDefault(preferences.listPerPage),
		}),
		[preferences.listPerPage],
	);

	const [{ page, per_page: perPageRaw }, setPageState] = useQueryStates(
		listPageParsers,
		{ history: "push" },
	);
	const perPage = normalizeListPerPage(perPageRaw);

	const goToPage = (nextPage: number) => {
		const safePage = Math.max(1, Math.floor(nextPage));
		void setPageState({ page: safePage <= 1 ? null : safePage });
	};

	const setPerPage = (nextPerPage: number) => {
		const safePerPage = normalizeListPerPage(nextPerPage);
		void setPageState({
			per_page: safePerPage === DEFAULT_LIST_PER_PAGE ? null : safePerPage,
			page: null,
		});
	};

	const resetPage = () => {
		void setPageState({ page: null });
	};

	return {
		goToPage,
		page,
		perPage,
		resetPage,
		setPerPage,
		setPage: setPageState,
	};
}
