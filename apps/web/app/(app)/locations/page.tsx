"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPinIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { FilterControl } from "@/components/filters/filter-control";
import { ListFilterBar } from "@/components/filters/list-filter-bar";
import { ListPagination } from "@/components/filters/list-pagination";
import { OptionalEntitySelect } from "@/components/filters/optional-entity-select";
import { SortFilterSelect } from "@/components/filters/sort-filter-select";
import { ResourceListCard } from "@/components/list/resource-list-card";
import { ResourceListQueryState } from "@/components/list/resource-list-query-state";
import { ResourcePage } from "@/components/list/resource-page";
import { TableEmptyState } from "@/components/query/table-empty-state";
import { TableRowActions } from "@/components/table/table-row-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDeferredQueryEnabled } from "@/hooks/use-deferred-query-enabled";
import { useDelayedPending } from "@/hooks/use-delayed-pending";
import { useDeleteRowMutation } from "@/hooks/use-delete-row-mutation";
import { usePermissions } from "@/hooks/use-permissions";
import { filtersAreDirty, withPaginationParams } from "@/lib/nuqs/filter-utils";
import { useLocationFilters } from "@/lib/nuqs/location-filters";
import { useListPage } from "@/lib/nuqs/use-list-page";
import { warehousesListQueryOptions } from "@/lib/queries/warehouses";
import { locationListResource } from "@/lib/resources/locations";

const sortOptions = [
	{ value: "__default__", label: "Newest first" },
	{ value: "code", label: "Code A-Z" },
	{ value: "-code", label: "Code Z-A" },
	{ value: "type", label: "Type A-Z" },
	{ value: "-type", label: "Type Z-A" },
] as const;

export default function LocationsPage() {
	const permissions = usePermissions();
	const { goToPage, page, perPage, resetPage, setPerPage } = useListPage();
	const {
		applied,
		apiQuery: filterQuery,
		applyFilters: applyFiltersBase,
		draft,
		resetFilters: resetFiltersBase,
		setDraft,
	} = useLocationFilters();
	const isDirty = filtersAreDirty(applied, draft);
	const apiQuery = useMemo(
		() => withPaginationParams(filterQuery, { page, perPage }),
		[filterQuery, page, perPage],
	);

	const applyFilters = () => {
		applyFiltersBase();
		resetPage();
	};

	const resetFilters = () => {
		resetFiltersBase();
		resetPage();
	};

	const permList = permissions.permissions;
	const canView = locationListResource.canView(permList);
	const canCreate = locationListResource.canManage(permList);
	const canEdit = locationListResource.canManage(permList);
	const canDelete = locationListResource.canManage(permList);

	const warehousesLoad = useDeferredQueryEnabled(Boolean(draft.warehouseId));

	const listQuery = useQuery({
		...locationListResource.listQueryOptions(apiQuery),
		placeholderData: (previousData) => previousData,
	});
	const warehousesQuery = useQuery({
		...warehousesListQueryOptions({ sort: ["name"] }),
		enabled: warehousesLoad.enabled,
	});

	const showPending = useDelayedPending(listQuery.isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	const { deleteRow, isDeleting } = useDeleteRowMutation({
		deleteFn: locationListResource.deleteFn,
		invalidateQueryKey: locationListResource.invalidateQueryKey,
		successMessage: locationListResource.deleteSuccessMessage,
		errorMessage: locationListResource.deleteErrorMessage,
	});

	return (
		<ResourcePage
			accessDeniedDescription={locationListResource.accessDeniedDescription}
			action={
				canCreate ? (
					<Button asChild size="sm" variant="outline">
						<Link href={locationListResource.createHref}>
							<PlusIcon data-icon="inline-start" />
							{locationListResource.createLabel}
						</Link>
					</Button>
				) : null
			}
			canView={canView}
			description={locationListResource.description}
			title={locationListResource.title}
		>
			<ResourceListCard
				filters={
					<ListFilterBar
						isDirty={isDirty}
						onApply={applyFilters}
						onReset={resetFilters}
					>
						<FilterControl label="Code">
							<Input
								className="w-full"
								onChange={(event) => {
									setDraft((current) => ({
										...current,
										code: event.target.value,
									}));
								}}
								placeholder="Search by code"
								value={draft.code}
							/>
						</FilterControl>
						<FilterControl label="Type">
							<Input
								className="w-full"
								onChange={(event) => {
									setDraft((current) => ({
										...current,
										type: event.target.value,
									}));
								}}
								placeholder="Search by type"
								value={draft.type}
							/>
						</FilterControl>
						<FilterControl label="Warehouse">
							<OptionalEntitySelect
								allLabel="All warehouses"
								disabled={warehousesQuery.isPending && warehousesLoad.enabled}
								items={(warehousesQuery.data?.data ?? []).map((warehouse) => ({
									value: String(warehouse.id),
									label: warehouse.code
										? `${warehouse.name} (${warehouse.code})`
										: warehouse.name,
								}))}
								loading={warehousesQuery.isPending && warehousesLoad.enabled}
								onOpenChange={warehousesLoad.onOpenChange}
								onValueChange={(warehouseId) => {
									setDraft((current) => ({ ...current, warehouseId }));
								}}
								placeholder="Any warehouse"
								value={draft.warehouseId}
							/>
						</FilterControl>
						<SortFilterSelect
							onValueChange={(value) => {
								setDraft((current) => ({ ...current, sort: value }));
							}}
							options={sortOptions}
							value={draft.sort}
						/>
					</ListFilterBar>
				}
			>
				<ResourceListQueryState
					data={listQuery.data}
					error={listQuery.error}
					errorDescription={locationListResource.errorDescription}
					errorTitle={locationListResource.errorTitle}
					isError={listQuery.isError}
					isFetching={listQuery.isFetching}
					isPendingVisible={showPending}
					loadingDescription={locationListResource.loadingDescription}
					loadingTitle={locationListResource.loadingTitle}
					onRetry={() => {
						void listQuery.refetch();
					}}
				>
					{(locations) => (
						<>
							<ListPagination
								itemLabel={locationListResource.itemLabel}
								meta={locations.meta}
								onPageChange={goToPage}
								onPerPageChange={setPerPage}
								perPage={perPage}
							/>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Warehouse</TableHead>
										<TableHead>Code</TableHead>
										<TableHead>Type</TableHead>
										{canEdit || canDelete ? (
											<TableHead className="text-right">Actions</TableHead>
										) : null}
									</TableRow>
								</TableHeader>
								<TableBody>
									{locations.data.length ? (
										locations.data.map((location) => (
											<TableRow key={location.id}>
												<TableCell>{location.id}</TableCell>
												<TableCell>
													<Link
														className="hover:underline"
														href={`/warehouses/${location.warehouse_id}`}
													>
														{location.warehouse_code || location.warehouse_id}
													</Link>
												</TableCell>
												<TableCell className="font-medium">
													<Link
														className="hover:underline"
														href={`/locations/${location.id}`}
													>
														{location.code}
													</Link>
												</TableCell>
												<TableCell>{location.type}</TableCell>
												{canEdit || canDelete ? (
													<TableCell className="text-right">
														<TableRowActions
															canDelete={canDelete}
															canEdit={canEdit}
															deleteDescription={
																<>
																	This permanently removes location{" "}
																	<span className="font-medium text-foreground">
																		{location.code}
																	</span>
																	. Stock or references tied to this location
																	may block deletion.
																</>
															}
															deleteTitle="Delete location?"
															editHref={`/locations/${location.id}/edit`}
															isDeletePending={isDeleting(location.id)}
															onDelete={() => deleteRow(location.id)}
														/>
													</TableCell>
												) : null}
											</TableRow>
										))
									) : (
										<TableEmptyState
											colSpan={canEdit || canDelete ? 5 : 4}
											description="Try adjusting the filters or create a storage location."
											icon={MapPinIcon}
											title="No locations found"
										/>
									)}
								</TableBody>
							</Table>
						</>
					)}
				</ResourceListQueryState>
			</ResourceListCard>
		</ResourcePage>
	);
}
