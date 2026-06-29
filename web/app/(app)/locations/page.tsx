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
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { RefreshingIndicator } from "@/components/query/refreshing-indicator";
import { TableEmptyState } from "@/components/query/table-empty-state";
import { TableRowActions } from "@/components/table/table-row-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { deleteLocation } from "@/lib/api/locations";
import { filtersAreDirty, withPaginationParams } from "@/lib/nuqs/filter-utils";
import { useLocationFilters } from "@/lib/nuqs/location-filters";
import { useListPage } from "@/lib/nuqs/use-list-page";
import { canManageLocations, canViewLocations } from "@/lib/permissions";
import {
	locationQueryKeys,
	locationsListQueryOptions,
} from "@/lib/queries/locations";
import { warehousesListQueryOptions } from "@/lib/queries/warehouses";

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
	const canView = canViewLocations(permList);
	const canCreate = canManageLocations(permList);
	const canEdit = canManageLocations(permList);
	const canDelete = canManageLocations(permList);

	const warehousesLoad = useDeferredQueryEnabled(Boolean(draft.warehouseId));

	const listQuery = useQuery({
		...locationsListQueryOptions(apiQuery),
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
		deleteFn: deleteLocation,
		invalidateQueryKey: locationQueryKeys.all,
		successMessage: "Location deleted",
		errorMessage: "Could not delete location.",
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<PageHeader
				action={
					canCreate ? (
						<Button asChild size="sm" variant="outline">
							<Link href="/locations/create">
								<PlusIcon data-icon="inline-start" />
								Create location
							</Link>
						</Button>
					) : null
				}
				description="Manage storage locations."
				title="Locations"
			/>
			{!canView ? (
				<ErrorState
					description="You do not have permission to view locations."
					title="Access denied"
				/>
			) : null}

			{canView ? (
				<Card>
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
					<CardContent className="pt-6">
						{showPending && !listQuery.data ? (
							<LoadingState title="Loading locations" />
						) : null}
						{listQuery.isError ? (
							<ErrorState
								error={listQuery.error}
								isRetrying={listQuery.isFetching && !showPending}
								onRetry={() => {
									void listQuery.refetch();
								}}
								title="Could not load locations"
							/>
						) : null}
						{listQuery.data ? (
							<div className="relative flex flex-col gap-3">
								{listQuery.isFetching && !showPending ? (
									<RefreshingIndicator />
								) : null}
								<ListPagination
									itemLabel="location"
									meta={listQuery.data.meta}
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
										{listQuery.data.data.length ? (
											listQuery.data.data.map((location) => (
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
							</div>
						) : null}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
