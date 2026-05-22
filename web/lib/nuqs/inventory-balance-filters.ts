"use client";

import { useQueryStates } from "nuqs";
import { useMemo } from "react";

import type { InventoryBalancesIndexQuery } from "@/lib/api/inventory";

import { parseAsOptionalString } from "./parsers";
import { useFilterDraft } from "./use-filter-draft";
import { useListSortParser } from "./use-list-sort-parser";

const balanceSortValues = [
	"id",
	"-id",
	"quantity",
	"-quantity",
	"created_at",
	"-created_at",
	"updated_at",
	"-updated_at",
] as const;

type BalanceSort = (typeof balanceSortValues)[number];

function isBalanceSort(value: string): value is BalanceSort {
	return balanceSortValues.includes(value as BalanceSort);
}

export function useInventoryBalanceFilters() {
	const sortParser = useListSortParser("inventory_balances");
	const filterParsers = useMemo(
		() => ({
			"filter[warehouse_id]": parseAsOptionalString,
			"filter[location_id]": parseAsOptionalString,
			"filter[product_id]": parseAsOptionalString,
			sort: sortParser,
		}),
		[sortParser],
	);

	const [urlState, setUrlState] = useQueryStates(filterParsers, {
		history: "push",
	});

	const applied = useMemo(
		() => ({
			warehouseId: urlState["filter[warehouse_id]"],
			locationId: urlState["filter[location_id]"],
			productId: urlState["filter[product_id]"],
			sort: urlState.sort,
		}),
		[urlState],
	);

	const [draft, setDraft] = useFilterDraft(applied);

	const apiQuery = useMemo<InventoryBalancesIndexQuery>(() => {
		const validSort =
			applied.sort !== "__default__" && isBalanceSort(applied.sort)
				? applied.sort
				: "";

		return {
			...(applied.warehouseId
				? { "filter[warehouse_id]": applied.warehouseId }
				: {}),
			...(applied.locationId
				? { "filter[location_id]": applied.locationId }
				: {}),
			...(applied.productId ? { "filter[product_id]": applied.productId } : {}),
			...(validSort ? { sort: [validSort] } : {}),
		};
	}, [applied]);

	const applyFilters = () => {
		void setUrlState({
			"filter[warehouse_id]": draft.warehouseId.trim() || null,
			"filter[location_id]": draft.locationId.trim() || null,
			"filter[product_id]": draft.productId.trim() || null,
			sort: draft.sort === "__default__" ? null : draft.sort,
		});
	};

	const resetFilters = () => {
		void setUrlState({
			"filter[warehouse_id]": null,
			"filter[location_id]": null,
			"filter[product_id]": null,
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
