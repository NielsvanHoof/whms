"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { FilterControl } from "@/components/filters/filter-control";
import { OptionalEntitySelect } from "@/components/filters/optional-entity-select";
import { useDeferredQueryEnabled } from "@/hooks/use-deferred-query-enabled";
import { locationsListQueryOptions } from "@/lib/queries/locations";
import { productsListQueryOptions } from "@/lib/queries/products";
import { warehousesListQueryOptions } from "@/lib/queries/warehouses";

export type InventoryEntityFilterFields = {
	warehouseId: string;
	locationId: string;
	productId: string;
};

type InventoryEntityFiltersProps<T extends InventoryEntityFilterFields> = {
	draft: T;
	setDraft: React.Dispatch<React.SetStateAction<T>>;
};

/**
 * Warehouse, location, and product pickers for inventory list filters.
 * Each list loads when its select is opened (unless already filtered via URL).
 */
export function InventoryEntityFilters<T extends InventoryEntityFilterFields>({
	draft,
	setDraft,
}: InventoryEntityFiltersProps<T>) {
	const warehousesLoad = useDeferredQueryEnabled(Boolean(draft.warehouseId));
	const locationsLoad = useDeferredQueryEnabled(Boolean(draft.locationId));
	const productsLoad = useDeferredQueryEnabled(Boolean(draft.productId));

	const warehousesQuery = useQuery({
		...warehousesListQueryOptions({ sort: ["name"] }),
		enabled: warehousesLoad.enabled,
	});
	const locationsQuery = useQuery({
		...locationsListQueryOptions(),
		enabled: locationsLoad.enabled,
	});
	const productsQuery = useQuery({
		...productsListQueryOptions({ sort: ["name"] }),
		enabled: productsLoad.enabled,
	});

	const warehouseItems = useMemo(
		() =>
			(warehousesQuery.data?.data ?? []).map((warehouse) => ({
				value: String(warehouse.id),
				label: warehouse.code
					? `${warehouse.name} (${warehouse.code})`
					: warehouse.name,
			})),
		[warehousesQuery.data],
	);

	const locationItems = useMemo(() => {
		const locations = locationsQuery.data?.data ?? [];
		const filtered = draft.warehouseId
			? locations.filter(
					(location) => String(location.warehouse_id) === draft.warehouseId,
				)
			: locations;

		return filtered.map((location) => ({
			value: String(location.id),
			label: location.warehouse_code
				? `${location.warehouse_code} · ${location.code}`
				: location.code,
		}));
	}, [locationsQuery.data, draft.warehouseId]);

	const productItems = useMemo(
		() =>
			(productsQuery.data?.data ?? []).map((product) => ({
				value: String(product.id),
				label: `${product.sku} — ${product.name}`,
			})),
		[productsQuery.data],
	);

	return (
		<>
			<FilterControl label="Warehouse">
				<OptionalEntitySelect
					allLabel="All warehouses"
					disabled={warehousesQuery.isPending && warehousesLoad.enabled}
					items={warehouseItems}
					loading={warehousesQuery.isPending && warehousesLoad.enabled}
					onOpenChange={warehousesLoad.onOpenChange}
					onValueChange={(warehouseId) => {
						setDraft((current) => {
							const next = { ...current, warehouseId };
							if (warehouseId && current.locationId) {
								const loc = locationsQuery.data?.data?.find(
									(l) => String(l.id) === current.locationId,
								);
								if (loc && String(loc.warehouse_id) !== warehouseId) {
									next.locationId = "";
								}
							}
							return next;
						});
					}}
					placeholder="Any warehouse"
					value={draft.warehouseId}
				/>
			</FilterControl>
			<FilterControl label="Location">
				<OptionalEntitySelect
					allLabel="All locations"
					disabled={locationsQuery.isPending && locationsLoad.enabled}
					items={locationItems}
					loading={locationsQuery.isPending && locationsLoad.enabled}
					onOpenChange={locationsLoad.onOpenChange}
					onValueChange={(locationId) => {
						setDraft((current) => ({ ...current, locationId }));
					}}
					placeholder="Any location"
					value={draft.locationId}
				/>
			</FilterControl>
			<FilterControl label="Product">
				<OptionalEntitySelect
					allLabel="All products"
					disabled={productsQuery.isPending && productsLoad.enabled}
					items={productItems}
					loading={productsQuery.isPending && productsLoad.enabled}
					onOpenChange={productsLoad.onOpenChange}
					onValueChange={(productId) => {
						setDraft((current) => ({ ...current, productId }));
					}}
					placeholder="Any product"
					value={draft.productId}
				/>
			</FilterControl>
		</>
	);
}
