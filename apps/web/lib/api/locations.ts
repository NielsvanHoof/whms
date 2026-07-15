import {
	appendListPagination,
	type ListPaginationQuery,
} from "@/lib/api/list-query-params";
import { createBrowserAuthedClient } from "@/lib/auth";
import type { components, operations } from "@/lib/openapi/schema";

export type LocationsIndexQuery =
	operations["locations.index"]["parameters"]["query"];
export type LocationsIndexResponse =
	operations["locations.index"]["responses"]["200"]["content"]["application/json"];

export type LocationShowResponse =
	operations["locations.show"]["responses"]["200"]["content"]["application/json"];

export type CreateLocationRequestBody =
	components["schemas"]["StoreLocationData"];
export type CreateLocationResponse =
	operations["locations.store"]["responses"]["200"]["content"]["application/json"];

export type UpdateLocationRequestBody =
	components["schemas"]["UpdateLocationData"];
export type UpdateLocationResponse =
	operations["locations.update"]["responses"]["200"]["content"]["application/json"];

function toLocationsSearchParams(
	query: LocationsIndexQuery & ListPaginationQuery,
): URLSearchParams {
	const searchParams = new URLSearchParams();

	if (query?.["filter[warehouse_id]"]) {
		searchParams.set("filter[warehouse_id]", query["filter[warehouse_id]"]);
	}
	if (query?.["filter[type]"]) {
		searchParams.set("filter[type]", query["filter[type]"]);
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

export async function listLocations(
	query: LocationsIndexQuery & ListPaginationQuery = {},
): Promise<LocationsIndexResponse> {
	return createBrowserAuthedClient()
		.get("api/v1/locations", {
			searchParams: toLocationsSearchParams(query),
		})
		.json<LocationsIndexResponse>();
}

export async function showLocation(
	locationId: number,
): Promise<LocationShowResponse> {
	return createBrowserAuthedClient()
		.get(`api/v1/locations/${locationId}`)
		.json<LocationShowResponse>();
}

export async function createLocation(
	body: CreateLocationRequestBody,
): Promise<CreateLocationResponse> {
	return createBrowserAuthedClient()
		.post("api/v1/locations", { json: body })
		.json<CreateLocationResponse>();
}

export async function updateLocation(
	locationId: number,
	body: Omit<UpdateLocationRequestBody, "location_id">,
): Promise<UpdateLocationResponse> {
	return createBrowserAuthedClient()
		.put(`api/v1/locations/${locationId}`, {
			json: { ...body, location_id: locationId },
		})
		.json<UpdateLocationResponse>();
}

export async function deleteLocation(locationId: number): Promise<void> {
	await createBrowserAuthedClient().delete(`api/v1/locations/${locationId}`);
}
