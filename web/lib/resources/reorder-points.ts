import type { ListPaginationQuery } from "@/lib/api/list-query-params";
import type { ReorderPointsIndexQuery } from "@/lib/api/reorder-points";
import { deleteReorderPoint } from "@/lib/api/reorder-points";
import { canManageInventory, canViewInventory } from "@/lib/permissions";
import {
	reorderPointQueryKeys,
	reorderPointsListQueryOptions,
} from "@/lib/queries/reorder-points";

import type { ListResource } from "./types";

export const reorderPointListResource = {
	title: "Reorder points",
	description: "Set low-stock thresholds per product and location.",
	createHref: "/inventory/reorder-points/create",
	createLabel: "Create reorder point",
	itemLabel: "reorder point",
	loadingTitle: "Loading reorder points",
	loadingDescription: "Fetching reorder points for the current query.",
	errorTitle: "Could not load reorder points",
	errorDescription: "The reorder points list could not be fetched.",
	accessDeniedDescription: "You do not have permission to view reorder points.",
	deleteSuccessMessage: "Reorder point deleted",
	deleteErrorMessage: "Could not delete reorder point.",
	canView: canViewInventory,
	canManage: canManageInventory,
	deleteFn: deleteReorderPoint,
	invalidateQueryKey: reorderPointQueryKeys.all,
	listQueryOptions: reorderPointsListQueryOptions,
} satisfies ListResource<
	ReorderPointsIndexQuery & ListPaginationQuery,
	typeof reorderPointsListQueryOptions
>;
