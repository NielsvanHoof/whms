"use client";

import { useQueryStates } from "nuqs";
import { useMemo } from "react";

import type { ProductsIndexQuery } from "@/lib/api/products";

import { parseAsOptionalString } from "./parsers";
import { useFilterDraft } from "./use-filter-draft";
import { useListSortParser } from "./use-list-sort-parser";

const productSortValues = ["name", "-name", "sku", "-sku"] as const;

type ProductSort = (typeof productSortValues)[number];

function isProductSort(value: string): value is ProductSort {
	return productSortValues.includes(value as ProductSort);
}

export function useProductFilters() {
	const sortParser = useListSortParser("products");
	const filterParsers = useMemo(
		() => ({
			"filter[name]": parseAsOptionalString,
			"filter[sku]": parseAsOptionalString,
			"filter[unit]": parseAsOptionalString,
			"filter[is_active]": parseAsOptionalString,
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
			sku: urlState["filter[sku]"],
			unit: urlState["filter[unit]"],
			isActive: urlState["filter[is_active]"] || "all",
			sort: urlState.sort,
		}),
		[urlState],
	);

	const [draft, setDraft] = useFilterDraft(applied);

	const apiQuery = useMemo<ProductsIndexQuery>(() => {
		const isActive = applied.isActive === "all" ? "" : applied.isActive;
		const validSort =
			applied.sort !== "__default__" && isProductSort(applied.sort)
				? applied.sort
				: "";

		return {
			...(applied.name ? { "filter[name]": applied.name } : {}),
			...(applied.sku ? { "filter[sku]": applied.sku } : {}),
			...(applied.unit ? { "filter[unit]": applied.unit } : {}),
			...(isActive ? { "filter[is_active]": isActive } : {}),
			...(validSort ? { sort: [validSort] } : {}),
		};
	}, [applied]);

	const applyFilters = () => {
		void setUrlState({
			"filter[name]": draft.name.trim() || null,
			"filter[sku]": draft.sku.trim() || null,
			"filter[unit]": draft.unit.trim() || null,
			"filter[is_active]": draft.isActive === "all" ? null : draft.isActive,
			sort: draft.sort === "__default__" ? null : draft.sort,
		});
	};

	const resetFilters = () => {
		void setUrlState({
			"filter[name]": null,
			"filter[sku]": null,
			"filter[unit]": null,
			"filter[is_active]": null,
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
