import type { ListPaginationQuery } from "@/lib/api/list-query-params";
import type { LocationsIndexQuery } from "@/lib/api/locations";
import { deleteLocation } from "@/lib/api/locations";
import { canManageLocations, canViewLocations } from "@/lib/permissions";
import {
	locationQueryKeys,
	locationsListQueryOptions,
} from "@/lib/queries/locations";

import type { ListResource } from "./types";

export const locationListResource = {
	title: "Locations",
	description: "Manage storage locations.",
	createHref: "/locations/create",
	createLabel: "Create location",
	itemLabel: "location",
	loadingTitle: "Loading locations",
	loadingDescription: "Fetching locations for the current query.",
	errorTitle: "Could not load locations",
	errorDescription: "The locations list could not be fetched.",
	accessDeniedDescription: "You do not have permission to view locations.",
	deleteSuccessMessage: "Location deleted",
	deleteErrorMessage: "Could not delete location.",
	canView: canViewLocations,
	canManage: canManageLocations,
	deleteFn: deleteLocation,
	invalidateQueryKey: locationQueryKeys.all,
	listQueryOptions: locationsListQueryOptions,
} satisfies ListResource<
	LocationsIndexQuery & ListPaginationQuery,
	typeof locationsListQueryOptions
>;
