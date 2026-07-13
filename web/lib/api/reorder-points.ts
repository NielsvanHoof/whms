import {
	appendListPagination,
	type ListPaginationQuery,
} from "@/lib/api/list-query-params";
import { createBrowserAuthedClient } from "@/lib/auth";
import type { components, operations } from "@/lib/openapi/schema";

export type ReorderPointsIndexQuery =
	operations["reorder-points.index"]["parameters"]["query"];
export type ReorderPointsIndexResponse =
	operations["reorder-points.index"]["responses"]["200"]["content"]["application/json"];

export type ReorderPointShowResponse =
	operations["reorder-points.show"]["responses"]["200"]["content"]["application/json"];

export type CreateReorderPointRequestBody =
	components["schemas"]["StoreReorderPointData"];
export type CreateReorderPointResponse =
	operations["reorder-points.store"]["responses"]["200"]["content"]["application/json"];

export type UpdateReorderPointRequestBody =
	components["schemas"]["UpdateReorderPointData"];
export type UpdateReorderPointResponse =
	operations["reorder-points.update"]["responses"]["200"]["content"]["application/json"];

export type LowStockIndexQuery =
	operations["inventory.lowStock"]["parameters"]["query"];
export type LowStockIndexResponse =
	operations["inventory.lowStock"]["responses"]["200"]["content"]["application/json"];

function toReorderPointsSearchParams(
	query: ReorderPointsIndexQuery & ListPaginationQuery,
): URLSearchParams {
	const searchParams = new URLSearchParams();

	if (query?.["filter[product_id]"]) {
		searchParams.set("filter[product_id]", query["filter[product_id]"]);
	}
	if (query?.["filter[location_id]"]) {
		searchParams.set("filter[location_id]", query["filter[location_id]"]);
	}
	if (query?.sort?.length) {
		for (const sortValue of query.sort) {
			searchParams.append("sort[]", sortValue);
		}
	}
	appendListPagination(searchParams, query);

	return searchParams;
}

export async function listReorderPoints(
	query: ReorderPointsIndexQuery & ListPaginationQuery = {},
): Promise<ReorderPointsIndexResponse> {
	return createBrowserAuthedClient()
		.get("api/v1/reorder-points", {
			searchParams: toReorderPointsSearchParams(query),
		})
		.json<ReorderPointsIndexResponse>();
}

export async function showReorderPoint(
	reorderPointId: number,
): Promise<ReorderPointShowResponse> {
	return createBrowserAuthedClient()
		.get(`api/v1/reorder-points/${reorderPointId}`)
		.json<ReorderPointShowResponse>();
}

export async function createReorderPoint(
	body: CreateReorderPointRequestBody,
): Promise<CreateReorderPointResponse> {
	return createBrowserAuthedClient()
		.post("api/v1/reorder-points", { json: body })
		.json<CreateReorderPointResponse>();
}

export async function updateReorderPoint(
	reorderPointId: number,
	body: Omit<UpdateReorderPointRequestBody, "reorder_point_id">,
): Promise<UpdateReorderPointResponse> {
	return createBrowserAuthedClient()
		.put(`api/v1/reorder-points/${reorderPointId}`, {
			json: { ...body, reorder_point_id: reorderPointId },
		})
		.json<UpdateReorderPointResponse>();
}

export async function deleteReorderPoint(
	reorderPointId: number,
): Promise<void> {
	await createBrowserAuthedClient().delete(
		`api/v1/reorder-points/${reorderPointId}`,
	);
}

function toLowStockSearchParams(
	query: LowStockIndexQuery & ListPaginationQuery,
): URLSearchParams {
	const searchParams = new URLSearchParams();

	if (query?.["filter[product_id]"]) {
		searchParams.set("filter[product_id]", query["filter[product_id]"]);
	}
	if (query?.["filter[location_id]"]) {
		searchParams.set("filter[location_id]", query["filter[location_id]"]);
	}
	if (query?.sort?.length) {
		for (const sortValue of query.sort) {
			searchParams.append("sort[]", sortValue);
		}
	}
	appendListPagination(searchParams, query);

	return searchParams;
}

export async function listLowStock(
	query: LowStockIndexQuery & ListPaginationQuery = {},
): Promise<LowStockIndexResponse> {
	return createBrowserAuthedClient()
		.get("api/v1/reorder-points/low-stock", {
			searchParams: toLowStockSearchParams(query),
		})
		.json<LowStockIndexResponse>();
}
