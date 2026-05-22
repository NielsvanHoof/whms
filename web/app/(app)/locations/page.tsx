"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DeleteConfirmDialog } from "@/components/confirm/delete-confirm-dialog";
import { FilterControl } from "@/components/filters/filter-control";
import { ListFilterBar } from "@/components/filters/list-filter-bar";
import { ListPagination } from "@/components/filters/list-pagination";
import { OptionalEntitySelect } from "@/components/filters/optional-entity-select";
import { SortFilterSelect } from "@/components/filters/sort-filter-select";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
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
import { toastApiError, toastSuccess } from "@/lib/toast";

const sortOptions = [
	{ value: "__default__", label: "Newest first" },
	{ value: "code", label: "Code A-Z" },
	{ value: "-code", label: "Code Z-A" },
	{ value: "type", label: "Type A-Z" },
	{ value: "-type", label: "Type Z-A" },
] as const;

export default function LocationsPage() {
	const queryClient = useQueryClient();
	const permissions = usePermissions();
	const [deletingId, setDeletingId] = useState<number | null>(null);
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
	const deleteMutation = useMutation({
		mutationFn: deleteLocation,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: locationQueryKeys.all });
			toastSuccess("Location deleted");
		},
		onError: (error) => {
			void toastApiError(error, "Could not delete location.");
		},
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex items-end justify-between gap-3">
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-2xl tracking-tight">Locations</h1>
					<p className="text-muted-foreground text-sm">
						Manage storage locations.
					</p>
				</div>
				{canCreate ? (
					<Button asChild variant="outline">
						<Link href="/locations/create">
							<PlusIcon data-icon="inline-start" />
							Create location
						</Link>
					</Button>
				) : null}
			</div>
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
						{listQuery.isPending && !listQuery.data ? (
							<LoadingState title="Loading locations" />
						) : null}
						{listQuery.isError ? (
							<ErrorState
								error={listQuery.error}
								title="Could not load locations"
							/>
						) : null}
						{listQuery.data ? (
							<div className="relative flex flex-col gap-3">
								{listQuery.isFetching && !listQuery.isPending ? (
									<div className="absolute inset-x-0 top-0 flex justify-center">
										<div className="rounded-md border bg-background/95 px-3 py-1 text-xs text-muted-foreground">
											Refreshing table...
										</div>
									</div>
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
										{listQuery.data.data.map((location) => (
											<TableRow key={location.id}>
												<TableCell>{location.id}</TableCell>
												<TableCell>
													{location.warehouse_code || location.warehouse_id}
												</TableCell>
												<TableCell>{location.code}</TableCell>
												<TableCell>{location.type}</TableCell>
												{canEdit || canDelete ? (
													<TableCell className="text-right">
														<div className="flex justify-end gap-2">
															{canEdit ? (
																<Button asChild size="sm" variant="outline">
																	<Link href={`/locations/${location.id}/edit`}>
																		<PencilIcon data-icon="inline-start" />
																		Edit
																	</Link>
																</Button>
															) : null}
															{canDelete ? (
																<DeleteConfirmDialog
																	description={
																		<>
																			This permanently removes location{" "}
																			<span className="font-medium text-foreground">
																				{location.code}
																			</span>
																			. Stock or references tied to this
																			location may block deletion.
																		</>
																	}
																	isPending={
																		deleteMutation.isPending &&
																		deletingId === location.id
																	}
																	onConfirm={async () => {
																		setDeletingId(location.id);
																		try {
																			await deleteMutation.mutateAsync(
																				location.id,
																			);
																		} finally {
																			setDeletingId(null);
																		}
																	}}
																	title="Delete location?"
																	trigger={
																		<Button
																			disabled={
																				deleteMutation.isPending &&
																				deletingId === location.id
																			}
																			size="sm"
																			type="button"
																			variant="outline"
																		>
																			<Trash2Icon data-icon="inline-start" />
																			Delete
																		</Button>
																	}
																/>
															) : null}
														</div>
													</TableCell>
												) : null}
											</TableRow>
										))}
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
