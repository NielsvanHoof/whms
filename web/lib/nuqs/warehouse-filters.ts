"use client";

import { useQueryStates } from "nuqs";
import { useMemo } from "react";

import type { WarehousesIndexQuery } from "@/lib/api/warehouses";

import { parseAsOptionalString } from "./parsers";
import { useFilterDraft } from "./use-filter-draft";
import { useListSortParser } from "./use-list-sort-parser";

const warehouseSortValues = [
	"id",
	"-id",
	"name",
	"-name",
	"code",
	"-code",
	"created_at",
	"-created_at",
] as const;

type WarehouseSort = (typeof warehouseSortValues)[number];

function isWarehouseSort(value: string): value is WarehouseSort {
	return warehouseSortValues.includes(value as WarehouseSort);
}

export function useWarehouseFilters() {
	const sortParser = useListSortParser("warehouses");
	const filterParsers = useMemo(
		() => ({
			"filter[name]": parseAsOptionalString,
			"filter[code]": parseAsOptionalString,
			sort: sortParser,
		}),
		[sortParser],
	);

	const [urlState, setUrlState] = useQueryStates(filterParsers, {
		history: "push",
	});

	const applied = useMemo(
		() => ({
			name: urlState["filter[name]"],
			code: urlState["filter[code]"],
			sort: urlState.sort,
		}),
		[urlState],
	);

	const [draft, setDraft] = useFilterDraft(applied);

	const apiQuery = useMemo<WarehousesIndexQuery>(() => {
		const validSort =
			applied.sort !== "__default__" && isWarehouseSort(applied.sort)
				? applied.sort
				: "";

		return {
			...(applied.name ? { "filter[name]": applied.name } : {}),
			...(applied.code ? { "filter[code]": applied.code } : {}),
			...(validSort ? { sort: [validSort] } : {}),
		};
	}, [applied]);

	const applyFilters = () => {
		void setUrlState({
			"filter[name]": draft.name.trim() || null,
			"filter[code]": draft.code.trim() || null,
			sort: draft.sort === "__default__" ? null : draft.sort,
		});
	};

	const resetFilters = () => {
		void setUrlState({
			"filter[name]": null,
			"filter[code]": null,
			sort: null,
		});
	};

	return {
		applied,
		apiQuery,
		applyFilters,
		draft,
		resetFilters,
		setDraft,
	};
}
