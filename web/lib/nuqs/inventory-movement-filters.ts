"use client";

import { useQueryStates } from "nuqs";
import { useMemo } from "react";

import type { InventoryMovementsIndexQuery } from "@/lib/api/inventory";

import {
	parseAsAllKindFilter,
	parseAsOptionalString,
	parseAsSelectSort,
} from "./parsers";
import { useFilterDraft } from "./use-filter-draft";

const movementSortValues = ["id", "-id", "created_at", "-created_at"] as const;

type MovementSort = (typeof movementSortValues)[number];

function isMovementSort(value: string): value is MovementSort {
	return movementSortValues.includes(value as MovementSort);
}

const movementFilterParsers = {
	"filter[warehouse_id]": parseAsOptionalString,
	"filter[location_id]": parseAsOptionalString,
	"filter[product_id]": parseAsOptionalString,
	"filter[kind]": parseAsAllKindFilter,
	"filter[transfer_correlation_id]": parseAsOptionalString,
	sort: parseAsSelectSort,
} as const;

export function useInventoryMovementFilters() {
	const [urlState, setUrlState] = useQueryStates(movementFilterParsers, {
		history: "push",
	});

	const applied = useMemo(
		() => ({
			warehouseId: urlState["filter[warehouse_id]"],
			locationId: urlState["filter[location_id]"],
			productId: urlState["filter[product_id]"],
			kind: urlState["filter[kind]"],
			correlationId: urlState["filter[transfer_correlation_id]"],
			sort: urlState.sort,
		}),
		[urlState],
	);

	const [draft, setDraft] = useFilterDraft(applied);

	const apiQuery = useMemo<InventoryMovementsIndexQuery>(() => {
		const kind = applied.kind === "__all__" ? "" : applied.kind;
		const validSort =
			applied.sort !== "__default__" && isMovementSort(applied.sort)
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
			...(kind ? { "filter[kind]": kind } : {}),
			...(applied.correlationId
				? { "filter[transfer_correlation_id]": applied.correlationId }
				: {}),
			...(validSort ? { sort: [validSort] } : {}),
		};
	}, [applied]);

	const applyFilters = () => {
		void setUrlState({
			"filter[warehouse_id]": draft.warehouseId.trim() || null,
			"filter[location_id]": draft.locationId.trim() || null,
			"filter[product_id]": draft.productId.trim() || null,
			"filter[kind]": draft.kind === "__all__" ? null : draft.kind,
			"filter[transfer_correlation_id]": draft.correlationId.trim() || null,
			sort: draft.sort === "__default__" ? null : draft.sort,
		});
	};

	const resetFilters = () => {
		void setUrlState({
			"filter[warehouse_id]": null,
			"filter[location_id]": null,
			"filter[product_id]": null,
			"filter[kind]": null,
			"filter[transfer_correlation_id]": null,
			sort: null,
		});
	};

	return {
		apiQuery,
		applyFilters,
		draft,
		resetFilters,
		setDraft,
	};
}
