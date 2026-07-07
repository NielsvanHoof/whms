import {
	appendListPagination,
	type ListPaginationQuery,
} from "@/lib/api/list-query-params";
import { createBrowserAuthedClient } from "@/lib/auth";
import type { components, operations } from "@/lib/openapi/schema";

export type InventoryBalancesIndexQuery =
	operations["inventory-balances.index"]["parameters"]["query"];
export type InventoryBalancesIndexResponse =
	operations["inventory-balances.index"]["responses"]["200"]["content"]["application/json"];

export type InventoryBalanceShowResponse =
	operations["inventory-balances.show"]["responses"]["200"]["content"]["application/json"];

export type InventoryMovementsIndexQuery =
	operations["inventoryMovement.index"]["parameters"]["query"];
export type InventoryMovementsIndexResponse =
	operations["inventoryMovement.index"]["responses"]["200"]["content"]["application/json"];

export type InventoryMovementShowResponse =
	operations["inventoryMovement.show"]["responses"]["200"]["content"]["application/json"];

export type StoreInventoryMovementRequestBody =
	components["schemas"]["StoreInventoryMovementData"];

export type ReceiptInventoryMovementData =
	components["schemas"]["ReceiptInventoryMovementData"];

export type AdjustmentInventoryMovementData =
	components["schemas"]["AdjustmentInventoryMovementData"];

export type TransferInventoryMovementData =
	components["schemas"]["TransferInventoryMovementData"];

export type CreateInventoryMovementResponse =
	operations["inventoryMovement.store"]["responses"]["201"]["content"]["application/json"];

function toInventoryBalancesSearchParams(
	query: InventoryBalancesIndexQuery & ListPaginationQuery,
): URLSearchParams {
	const searchParams = new URLSearchParams();

	if (query?.["filter[warehouse_id]"]) {
		searchParams.set("filter[warehouse_id]", query["filter[warehouse_id]"]);
	}
	if (query?.["filter[location_id]"]) {
		searchParams.set("filter[location_id]", query["filter[location_id]"]);
	}
	if (query?.["filter[product_id]"]) {
		searchParams.set("filter[product_id]", query["filter[product_id]"]);
	}
	if (query?.sort?.length) {
		for (const sortValue of query.sort) {
			searchParams.append("sort[]", sortValue);
		}
	}
	appendListPagination(searchParams, query);

	return searchParams;
}

function toInventoryMovementsSearchParams(
	query: InventoryMovementsIndexQuery & ListPaginationQuery,
): URLSearchParams {
	const searchParams = new URLSearchParams();

	if (query?.["filter[warehouse_id]"]) {
		searchParams.set("filter[warehouse_id]", query["filter[warehouse_id]"]);
	}
	if (query?.["filter[location_id]"]) {
		searchParams.set("filter[location_id]", query["filter[location_id]"]);
	}
	if (query?.["filter[product_id]"]) {
		searchParams.set("filter[product_id]", query["filter[product_id]"]);
	}
	if (query?.["filter[kind]"]) {
		searchParams.set("filter[kind]", query["filter[kind]"]);
	}
	if (query?.["filter[transfer_correlation_id]"]) {
		searchParams.set(
			"filter[transfer_correlation_id]",
			query["filter[transfer_correlation_id]"],
		);
	}
	if (query?.sort?.length) {
		for (const sortValue of query.sort) {
			searchParams.append("sort[]", sortValue);
		}
	}
	appendListPagination(searchParams, query);

	return searchParams;
}

export async function listInventoryBalances(
	query: InventoryBalancesIndexQuery & ListPaginationQuery = {},
): Promise<InventoryBalancesIndexResponse> {
	return createBrowserAuthedClient()
		.get("api/v1/inventory-balances", {
			searchParams: toInventoryBalancesSearchParams(query),
		})
		.json<InventoryBalancesIndexResponse>();
}

export async function showInventoryBalance(
	inventoryBalanceId: number,
): Promise<InventoryBalanceShowResponse> {
	return createBrowserAuthedClient()
		.get(`api/v1/inventory-balances/${inventoryBalanceId}`)
		.json<InventoryBalanceShowResponse>();
}

export async function listInventoryMovements(
	query: InventoryMovementsIndexQuery & ListPaginationQuery = {},
): Promise<InventoryMovementsIndexResponse> {
	return createBrowserAuthedClient()
		.get("api/v1/inventory-movements", {
			searchParams: toInventoryMovementsSearchParams(query),
		})
		.json<InventoryMovementsIndexResponse>();
}

export async function showInventoryMovement(
	inventoryMovementId: number,
): Promise<InventoryMovementShowResponse> {
	return createBrowserAuthedClient()
		.get(`api/v1/inventory-movements/${inventoryMovementId}`)
		.json<InventoryMovementShowResponse>();
}

export async function createInventoryMovement(
	body: StoreInventoryMovementRequestBody,
): Promise<CreateInventoryMovementResponse> {
	return createBrowserAuthedClient()
		.post("api/v1/inventory-movements", { json: body })
		.json<CreateInventoryMovementResponse>();
}

function toInventoryExportSearchParams(
	query: InventoryBalancesIndexQuery,
): URLSearchParams {
	const searchParams = new URLSearchParams();

	if (query?.["filter[warehouse_id]"]) {
		searchParams.set("filter[warehouse_id]", query["filter[warehouse_id]"]);
	}
	if (query?.["filter[location_id]"]) {
		searchParams.set("filter[location_id]", query["filter[location_id]"]);
	}
	if (query?.["filter[product_id]"]) {
		searchParams.set("filter[product_id]", query["filter[product_id]"]);
	}
	if (query?.sort?.length) {
		for (const sortValue of query.sort) {
			searchParams.append("sort[]", sortValue);
		}
	}

	return searchParams;
}

function toInventoryMovementsExportSearchParams(
	query: InventoryMovementsIndexQuery,
): URLSearchParams {
	const searchParams = new URLSearchParams();

	if (query?.["filter[warehouse_id]"]) {
		searchParams.set("filter[warehouse_id]", query["filter[warehouse_id]"]);
	}
	if (query?.["filter[location_id]"]) {
		searchParams.set("filter[location_id]", query["filter[location_id]"]);
	}
	if (query?.["filter[product_id]"]) {
		searchParams.set("filter[product_id]", query["filter[product_id]"]);
	}
	if (query?.["filter[kind]"]) {
		searchParams.set("filter[kind]", query["filter[kind]"]);
	}
	if (query?.["filter[transfer_correlation_id]"]) {
		searchParams.set(
			"filter[transfer_correlation_id]",
			query["filter[transfer_correlation_id]"],
		);
	}
	if (query?.sort?.length) {
		for (const sortValue of query.sort) {
			searchParams.append("sort[]", sortValue);
		}
	}

	return searchParams;
}

export async function exportInventoryBalancesCsv(
	query: InventoryBalancesIndexQuery = {},
): Promise<Blob> {
	return createBrowserAuthedClient()
		.get("api/v1/inventory-balances/export", {
			searchParams: toInventoryExportSearchParams(query),
		})
		.blob();
}

export async function exportInventoryMovementsCsv(
	query: InventoryMovementsIndexQuery = {},
): Promise<Blob> {
	return createBrowserAuthedClient()
		.get("api/v1/inventory-movements/export", {
			searchParams: toInventoryMovementsExportSearchParams(query),
		})
		.blob();
}
