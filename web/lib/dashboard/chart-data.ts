import type { components } from "@/lib/openapi/schema";

type BalanceRow = components["schemas"]["InventoryBalanceResource"];
type MovementRow = components["schemas"]["InventoryMovementResource"];

export type StockBarDatum = {
	sku: string;
	quantity: number;
};

export type MovementKindDatum = {
	kind: string;
	count: number;
	fill: string;
};

export type MovementDayDatum = {
	date: string;
	movements: number;
};

const KIND_LABELS: Record<string, string> = {
	receipt: "Receipt",
	adjustment: "Adjustment",
	transfer: "Transfer",
};

const KIND_COLORS: Record<string, string> = {
	receipt: "var(--chart-1)",
	adjustment: "var(--chart-2)",
	transfer: "var(--chart-3)",
};

/** Top SKU rows for a horizontal/vertical bar chart (highest quantity first). */
export function stockBarDataFromBalances(
	balances: readonly BalanceRow[],
	limit = 8,
): StockBarDatum[] {
	return [...balances]
		.sort((a, b) => b.quantity - a.quantity)
		.slice(0, limit)
		.map((row) => ({
			sku: row.product?.sku ?? `Product ${row.product_id}`,
			quantity: row.quantity,
		}));
}

/** Count ledger rows per movement kind on the current result page. */
export function movementKindDataFromMovements(
	movements: readonly MovementRow[],
): MovementKindDatum[] {
	const counts = new Map<string, number>();
	for (const row of movements) {
		const key = row.kind.toLowerCase();
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	return [...counts.entries()].map(([kind, count]) => ({
		kind: KIND_LABELS[kind] ?? kind,
		count,
		fill: KIND_COLORS[kind] ?? "var(--chart-4)",
	}));
}

/** Group movements by calendar day for a simple activity chart. */
export function movementActivityByDay(
	movements: readonly MovementRow[],
): MovementDayDatum[] {
	const counts = new Map<string, number>();
	for (const row of movements) {
		const date = new Date(row.created_at);
		if (Number.isNaN(date.getTime())) {
			continue;
		}
		const key = date.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
		});
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([date, movementsCount]) => ({
			date,
			movements: movementsCount,
		}))
		.slice(-14);
}

export type SetupCountDatum = {
	resource: string;
	count: number;
};

export function setupCountData(counts: {
	warehouses?: number;
	locations?: number;
	products?: number;
}): SetupCountDatum[] {
	const rows: SetupCountDatum[] = [];
	if (counts.warehouses !== undefined) {
		rows.push({ resource: "Warehouses", count: counts.warehouses });
	}
	if (counts.locations !== undefined) {
		rows.push({ resource: "Locations", count: counts.locations });
	}
	if (counts.products !== undefined) {
		rows.push({ resource: "Products", count: counts.products });
	}
	return rows;
}
