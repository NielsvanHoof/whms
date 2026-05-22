"use client";

import { useQueryStates } from "nuqs";
import { useMemo } from "react";

import type { LocationsIndexQuery } from "@/lib/api/locations";

import { parseAsOptionalString } from "./parsers";
import { useFilterDraft } from "./use-filter-draft";
import { useListSortParser } from "./use-list-sort-parser";

const locationSortValues = ["code", "-code", "type", "-type"] as const;

type LocationSort = (typeof locationSortValues)[number];

function isLocationSort(value: string): value is LocationSort {
	return locationSortValues.includes(value as LocationSort);
}

export function useLocationFilters() {
	const sortParser = useListSortParser("locations");
	const filterParsers = useMemo(
		() => ({
			"filter[code]": parseAsOptionalString,
			"filter[type]": parseAsOptionalString,
			"filter[warehouse_id]": parseAsOptionalString,
			sort: sortParser,
		}),
		[sortParser],
	);

	const [urlState, setUrlState] = useQueryStates(filterParsers, {
		history: "push",
	});

	const applied = useMemo(
		() => ({
			code: urlState["filter[code]"],
			type: urlState["filter[type]"],
			warehouseId: urlState["filter[warehouse_id]"],
			sort: urlState.sort,
		}),
		[urlState],
	);

	const [draft, setDraft] = useFilterDraft(applied);

	const apiQuery = useMemo<LocationsIndexQuery>(() => {
		const validSort =
			applied.sort !== "__default__" && isLocationSort(applied.sort)
				? applied.sort
				: "";

		return {
			...(applied.code ? { "filter[code]": applied.code } : {}),
			...(applied.type ? { "filter[type]": applied.type } : {}),
			...(applied.warehouseId
				? { "filter[warehouse_id]": applied.warehouseId }
				: {}),
			...(validSort ? { sort: [validSort] } : {}),
		};
	}, [applied]);

	const applyFilters = () => {
		void setUrlState({
			"filter[code]": draft.code.trim() || null,
			"filter[type]": draft.type.trim() || null,
			"filter[warehouse_id]": draft.warehouseId.trim() || null,
			sort: draft.sort === "__default__" ? null : draft.sort,
		});
	};

	const resetFilters = () => {
		void setUrlState({
			"filter[code]": null,
			"filter[type]": null,
			"filter[warehouse_id]": null,
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
