import type { InventoryMovementKind } from "@/lib/api/inventory";

/** Movements list filtered to one transfer's correlation id. */
export function transferMovementsListUrl(correlationId: string): string {
	const params = new URLSearchParams();
	params.set("filter[transfer_correlation_id]", correlationId);
	return `/inventory/movements?${params.toString()}`;
}

export function movementDetailUrl(movementId: number): string {
	return `/inventory/movements/${movementId}`;
}

/** Open movements page with record form pre-filled (cycle count / adjustment). */
export function recordMovementPrefillUrl(options: {
	kind?: Extract<InventoryMovementKind, "adjustment" | "receipt">;
	locationId: number;
	productId: number;
}): string {
	const params = new URLSearchParams();
	params.set("prefill_kind", options.kind ?? "adjustment");
	params.set("prefill_location_id", String(options.locationId));
	params.set("prefill_product_id", String(options.productId));
	return `/inventory/movements?${params.toString()}`;
}

/** Balances list narrowed to one location × product row. */
export function balancesForStockUrl(options: {
	locationId: number;
	productId: number;
	warehouseId?: number;
}): string {
	const params = new URLSearchParams();
	if (options.warehouseId) {
		params.set("filter[warehouse_id]", String(options.warehouseId));
	}
	params.set("filter[location_id]", String(options.locationId));
	params.set("filter[product_id]", String(options.productId));
	return `/inventory/balances?${params.toString()}`;
}
