import type { ListPreferenceKey } from "@/lib/preferences/user-preferences";

export type SortOption = { value: string; label: string };

/** Sort choices shown in Settings and used to validate stored defaults. */
export const LIST_SORT_OPTIONS: Record<
	ListPreferenceKey,
	readonly SortOption[]
> = {
	products: [
		{ value: "__default__", label: "No default (newest first)" },
		{ value: "name", label: "Name A-Z" },
		{ value: "-name", label: "Name Z-A" },
		{ value: "sku", label: "SKU A-Z" },
		{ value: "-sku", label: "SKU Z-A" },
	],
	warehouses: [
		{ value: "__default__", label: "No default (newest first)" },
		{ value: "name", label: "Name A-Z" },
		{ value: "-name", label: "Name Z-A" },
		{ value: "code", label: "Code A-Z" },
		{ value: "-code", label: "Code Z-A" },
		{ value: "created_at", label: "Oldest first" },
		{ value: "-created_at", label: "Newest first" },
	],
	locations: [
		{ value: "__default__", label: "No default" },
		{ value: "code", label: "Code A-Z" },
		{ value: "-code", label: "Code Z-A" },
		{ value: "type", label: "Type A-Z" },
		{ value: "-type", label: "Type Z-A" },
	],
	inventory_balances: [
		{ value: "__default__", label: "No default" },
		{ value: "quantity", label: "Quantity low-high" },
		{ value: "-quantity", label: "Quantity high-low" },
		{ value: "updated_at", label: "Updated oldest" },
		{ value: "-updated_at", label: "Updated newest" },
	],
	inventory_movements: [
		{ value: "__default__", label: "No default (newest first)" },
		{ value: "created_at", label: "Oldest first" },
		{ value: "-created_at", label: "Newest first" },
	],
};

export function isValidSortForList(
	listKey: ListPreferenceKey,
	sort: string,
): boolean {
	return LIST_SORT_OPTIONS[listKey].some((option) => option.value === sort);
}

export const LIST_PREFERENCE_LABELS: Record<ListPreferenceKey, string> = {
	products: "Products",
	warehouses: "Warehouses",
	locations: "Locations",
	inventory_balances: "Inventory balances",
	inventory_movements: "Inventory movements",
};
