import { queryOptions } from "@tanstack/react-query";

import type { ListPageQuery } from "@/lib/api/list-query-params";
import {
	type LocationsIndexQuery,
	listLocations,
	showLocation,
} from "@/lib/api/locations";

export const locationQueryKeys = {
	all: ["locations"] as const,
	list: (query: LocationsIndexQuery & ListPageQuery) =>
		[...locationQueryKeys.all, "list", query] as const,
	detail: (locationId: number) =>
		[...locationQueryKeys.all, "detail", locationId] as const,
};

export function locationsListQueryOptions(
	query: LocationsIndexQuery & ListPageQuery = {},
) {
	return queryOptions({
		queryKey: locationQueryKeys.list(query),
		queryFn: () => listLocations(query),
	});
}

export function locationDetailQueryOptions(locationId: number) {
	return queryOptions({
		queryKey: locationQueryKeys.detail(locationId),
		queryFn: () => showLocation(locationId),
	});
}
