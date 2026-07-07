import {
	appendListPagination,
	type ListPaginationQuery,
} from "@/lib/api/list-query-params";
import { createBrowserAuthedClient } from "@/lib/auth";
import type { components, operations } from "@/lib/openapi/schema";

export type WarehousesIndexResponse =
	operations["warehouses.index"]["responses"]["200"]["content"]["application/json"];
export type WarehousesIndexQuery =
	operations["warehouses.index"]["parameters"]["query"];
export type CreateWarehouseRequestBody =
	components["schemas"]["StoreWarehouseData"];
export type CreateWarehouseResponse =
	operations["warehouses.store"]["responses"]["200"]["content"]["application/json"];
export type WarehouseShowResponse =
	operations["warehouses.show"]["responses"]["200"]["content"]["application/json"];
export type UpdateWarehouseRequestBody =
	components["schemas"]["UpdateWarehouseData"];
export type UpdateWarehouseResponse =
	operations["warehouses.update"]["responses"]["200"]["content"]["application/json"];

function toWarehousesSearchParams(
	query: WarehousesIndexQuery & ListPaginationQuery,
): URLSearchParams {
	const searchParams = new URLSearchParams();

	if (query?.["filter[name]"]) {
		searchParams.set("filter[name]", query["filter[name]"]);
	}

	if (query?.["filter[code]"]) {
		searchParams.set("filter[code]", query["filter[code]"]);
	}

	if (query?.sort?.length) {
		for (const sortValue of query.sort) {
			searchParams.append("sort[]", sortValue);
		}
	}
	appendListPagination(searchParams, query);

	return searchParams;
}

/**
 * Fetches the current tenant's warehouses.
 */
export async function listWarehouses(
	query: WarehousesIndexQuery & ListPaginationQuery = {},
): Promise<WarehousesIndexResponse> {
	return createBrowserAuthedClient()
		.get("api/v1/warehouses", {
			searchParams: toWarehousesSearchParams(query),
		})
		.json<WarehousesIndexResponse>();
}

/**
 * Creates a warehouse for the current tenant.
 */
export async function createWarehouse(
	body: CreateWarehouseRequestBody,
): Promise<CreateWarehouseResponse> {
	return createBrowserAuthedClient()
		.post("api/v1/warehouses", { json: body })
		.json<CreateWarehouseResponse>();
}

export async function showWarehouse(
	warehouseId: number,
): Promise<WarehouseShowResponse> {
	return createBrowserAuthedClient()
		.get(`api/v1/warehouses/${warehouseId}`)
		.json<WarehouseShowResponse>();
}

export async function updateWarehouse(
	warehouseId: number,
	body: Omit<UpdateWarehouseRequestBody, "warehouse_id">,
): Promise<UpdateWarehouseResponse> {
	return createBrowserAuthedClient()
		.put(`api/v1/warehouses/${warehouseId}`, {
			json: { ...body, warehouse_id: warehouseId },
		})
		.json<UpdateWarehouseResponse>();
}

export async function deleteWarehouse(warehouseId: number): Promise<void> {
	await createBrowserAuthedClient().delete(`api/v1/warehouses/${warehouseId}`);
}
