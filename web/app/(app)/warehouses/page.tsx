"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DeleteConfirmDialog } from "@/components/confirm/delete-confirm-dialog";
import { FilterControl } from "@/components/filters/filter-control";
import { ListFilterBar } from "@/components/filters/list-filter-bar";
import { ListPagination } from "@/components/filters/list-pagination";
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
import { useDelayedPending } from "@/hooks/use-delayed-pending";
import { usePermissions } from "@/hooks/use-permissions";
import { deleteWarehouse } from "@/lib/api/warehouses";
import { filtersAreDirty, withPaginationParams } from "@/lib/nuqs/filter-utils";
import { useListPage } from "@/lib/nuqs/use-list-page";
import { useWarehouseFilters } from "@/lib/nuqs/warehouse-filters";
import { canManageWarehouses, canViewWarehouses } from "@/lib/permissions";
import {
	warehouseQueryKeys,
	warehousesListQueryOptions,
} from "@/lib/queries/warehouses";
import { toastApiError, toastSuccess } from "@/lib/toast";

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

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return date.toLocaleString();
}

export default function WarehousesPage() {
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
		...warehousesListQueryOptions(apiQuery),
		placeholderData: (previousData) => previousData,
	});

	const showPending = useDelayedPending(isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	const permList = permissions.permissions;
	const canView = canViewWarehouses(permList);
	const canCreate = canManageWarehouses(permList);
	const canEdit = canManageWarehouses(permList);
	const canDelete = canManageWarehouses(permList);

	const deleteMutation = useMutation({
		mutationFn: deleteWarehouse,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.all });
			toastSuccess("Warehouse deleted");
		},
		onError: (error) => {
			void toastApiError(error, "Could not delete warehouse.");
		},
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl tracking-tight">Warehouses</h1>
				<p className="text-muted-foreground text-sm">
					Browse tenant warehouses and filter by name or code.
				</p>
				{canCreate ? (
					<div>
						<Button asChild size="sm" variant="outline">
							<Link href="/warehouses/create">
								<PlusIcon data-icon="inline-start" />
								Create warehouse
							</Link>
						</Button>
					</div>
				) : null}
			</div>
			{!canView ? (
				<ErrorState
					description="You do not have permission to view warehouses."
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
					<CardContent className="pt-6">
						{showPending && !warehouses ? (
							<LoadingState
								description="Loading warehouses for the current query."
								title="Fetching warehouses"
							/>
						) : null}

						{isError ? (
							<ErrorState
								description="The warehouses list could not be fetched."
								error={error}
								isRetrying={isFetching && !showPending}
								onRetry={() => {
									void refetch();
								}}
								title="Could not load warehouses"
							/>
						) : null}

						{!isError && warehouses ? (
							<div className="relative flex flex-col gap-3">
								{isFetching && !showPending ? (
									<div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center">
										<div className="rounded-md border border-border bg-background/95 px-3 py-1 text-muted-foreground text-xs shadow-xs">
											Refreshing table...
										</div>
									</div>
								) : null}
								<ListPagination
									itemLabel="warehouse"
									meta={warehouses.meta}
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
										{warehouses?.data.length ? (
											warehouses.data.map((warehouse) => (
												<TableRow key={warehouse.id}>
													<TableCell>{warehouse.id}</TableCell>
													<TableCell className="font-medium">
														{warehouse.name}
													</TableCell>
													<TableCell>{warehouse.code ?? "-"}</TableCell>
													<TableCell>
														{formatDate(warehouse.created_at)}
													</TableCell>
													{canEdit || canDelete ? (
														<TableCell className="text-right">
															<div className="flex justify-end gap-2">
																{canEdit ? (
																	<Button asChild size="sm" variant="outline">
																		<Link
																			href={`/warehouses/${warehouse.id}/edit`}
																		>
																			<PencilIcon data-icon="inline-start" />
																			Edit
																		</Link>
																	</Button>
																) : null}
																{canDelete ? (
																	<DeleteConfirmDialog
																		description={
																			<>
																				This permanently removes{" "}
																				<span className="font-medium text-foreground">
																					{warehouse.name}
																				</span>
																				. Locations in this warehouse may block
																				deletion.
																			</>
																		}
																		isPending={
																			deleteMutation.isPending &&
																			deletingId === warehouse.id
																		}
																		onConfirm={async () => {
																			setDeletingId(warehouse.id);
																			try {
																				await deleteMutation.mutateAsync(
																					warehouse.id,
																				);
																			} finally {
																				setDeletingId(null);
																			}
																		}}
																		title="Delete warehouse?"
																		trigger={
																			<Button
																				disabled={
																					deleteMutation.isPending &&
																					deletingId === warehouse.id
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
											))
										) : (
											<TableRow>
												<TableCell
													className="text-muted-foreground"
													colSpan={canEdit || canDelete ? 5 : 4}
												>
													No warehouses matched the current filters.
												</TableCell>
											</TableRow>
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
