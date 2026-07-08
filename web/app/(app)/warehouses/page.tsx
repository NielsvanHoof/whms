"use client";

import { useQuery } from "@tanstack/react-query";
import { PlusIcon, WarehouseIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { FilterControl } from "@/components/filters/filter-control";
import { ListFilterBar } from "@/components/filters/list-filter-bar";
import { ListPagination } from "@/components/filters/list-pagination";
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
import { useDelayedPending } from "@/hooks/use-delayed-pending";
import { useDeleteRowMutation } from "@/hooks/use-delete-row-mutation";
import { usePermissions } from "@/hooks/use-permissions";
import { filtersAreDirty, withPaginationParams } from "@/lib/nuqs/filter-utils";
import { useListPage } from "@/lib/nuqs/use-list-page";
import { useWarehouseFilters } from "@/lib/nuqs/warehouse-filters";
import { warehouseListResource } from "@/lib/resources/warehouses";
import { formatDate } from "@/lib/utils";

const sortOptions = [
	{ value: "__default__", label: "Newest first (default)" },
	{ value: "id", label: "ID ascending" },
	{ value: "-id", label: "ID descending" },
	{ value: "name", label: "Name A-Z" },
	{ value: "-name", label: "Name Z-A" },
	{ value: "code", label: "Code A-Z" },
	{ value: "-code", label: "Code Z-A" },
	{ value: "created_at", label: "Oldest first" },
	{ value: "-created_at", label: "Newest first" },
] as const;

export default function WarehousesPage() {
	const permissions = usePermissions();
	const { goToPage, page, perPage, resetPage, setPerPage } = useListPage();
	const {
		applied,
		apiQuery: filterQuery,
		applyFilters: applyFiltersBase,
		draft,
		resetFilters: resetFiltersBase,
		setDraft,
	} = useWarehouseFilters();
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

	const {
		data: warehouses,
		error,
		isError,
		isFetching,
		isPending,
		refetch,
	} = useQuery({
		...warehouseListResource.listQueryOptions(apiQuery),
		placeholderData: (previousData) => previousData,
	});

	const showPending = useDelayedPending(isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	const permList = permissions.permissions;
	const canView = warehouseListResource.canView(permList);
	const canCreate = warehouseListResource.canManage(permList);
	const canEdit = warehouseListResource.canManage(permList);
	const canDelete = warehouseListResource.canManage(permList);

	const { deleteRow, isDeleting } = useDeleteRowMutation({
		deleteFn: warehouseListResource.deleteFn,
		invalidateQueryKey: warehouseListResource.invalidateQueryKey,
		successMessage: warehouseListResource.deleteSuccessMessage,
		errorMessage: warehouseListResource.deleteErrorMessage,
	});

	return (
		<ResourcePage
			accessDeniedDescription={warehouseListResource.accessDeniedDescription}
			action={
				canCreate ? (
					<Button asChild size="sm" variant="outline">
						<Link href={warehouseListResource.createHref}>
							<PlusIcon data-icon="inline-start" />
							{warehouseListResource.createLabel}
						</Link>
					</Button>
				) : null
			}
			canView={canView}
			description={warehouseListResource.description}
			title={warehouseListResource.title}
		>
			<ResourceListCard
				filters={
					<ListFilterBar
						isDirty={isDirty}
						onApply={applyFilters}
						onReset={resetFilters}
					>
						<FilterControl label="Name">
							<Input
								className="w-full"
								name="filter[name]"
								onChange={(event) => {
									setDraft((current) => ({
										...current,
										name: event.target.value,
									}));
								}}
								placeholder="Search by name"
								value={draft.name}
							/>
						</FilterControl>
						<FilterControl label="Code">
							<Input
								className="w-full"
								name="filter[code]"
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
					data={warehouses}
					error={error}
					errorDescription={warehouseListResource.errorDescription}
					errorTitle={warehouseListResource.errorTitle}
					isError={isError}
					isFetching={isFetching}
					isPendingVisible={showPending}
					loadingDescription={warehouseListResource.loadingDescription}
					loadingTitle={warehouseListResource.loadingTitle}
					onRetry={() => {
						void refetch();
					}}
				>
					{(warehouseResponse) => (
						<>
							<ListPagination
								itemLabel={warehouseListResource.itemLabel}
								meta={warehouseResponse.meta}
								onPageChange={goToPage}
								onPerPageChange={setPerPage}
								perPage={perPage}
							/>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Code</TableHead>
										<TableHead>Created</TableHead>
										{canEdit || canDelete ? (
											<TableHead className="text-right">Actions</TableHead>
										) : null}
									</TableRow>
								</TableHeader>
								<TableBody>
									{warehouseResponse.data.length ? (
										warehouseResponse.data.map((warehouse) => (
											<TableRow key={warehouse.id}>
												<TableCell>{warehouse.id}</TableCell>
												<TableCell className="font-medium">
													<Link
														className="hover:underline"
														href={`/warehouses/${warehouse.id}`}
													>
														{warehouse.name}
													</Link>
												</TableCell>
												<TableCell>{warehouse.code ?? "-"}</TableCell>
												<TableCell>
													{formatDate(warehouse.created_at)}
												</TableCell>
												{canEdit || canDelete ? (
													<TableCell className="text-right">
														<TableRowActions
															canDelete={canDelete}
															canEdit={canEdit}
															deleteDescription={
																<>
																	This permanently removes{" "}
																	<span className="font-medium text-foreground">
																		{warehouse.name}
																	</span>
																	. Locations in this warehouse may block
																	deletion.
																</>
															}
															deleteTitle="Delete warehouse?"
															editHref={`/warehouses/${warehouse.id}/edit`}
															isDeletePending={isDeleting(warehouse.id)}
															onDelete={() => deleteRow(warehouse.id)}
														/>
													</TableCell>
												) : null}
											</TableRow>
										))
									) : (
										<TableEmptyState
											colSpan={canEdit || canDelete ? 5 : 4}
											description="Try adjusting the filters or create the first warehouse for this tenant."
											icon={WarehouseIcon}
											title="No warehouses found"
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
