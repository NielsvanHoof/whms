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

function toWarehousesSearchParams(
	query: WarehousesIndexQuery,
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

	return searchParams;
}

/**
 * Fetches the current tenant's warehouses.
 */
export async function listWarehouses(
	query: WarehousesIndexQuery = {},
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

export async function deleteWarehouse(warehouseId: number): Promise<void> {
	await createBrowserAuthedClient().delete(`api/v1/warehouses/${warehouseId}`);
}
