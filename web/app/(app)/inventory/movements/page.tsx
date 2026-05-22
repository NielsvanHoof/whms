"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";

import { FilterControl } from "@/components/filters/filter-control";
import { ListFilterBar } from "@/components/filters/list-filter-bar";
import { ListPagination } from "@/components/filters/list-pagination";
import { SortFilterSelect } from "@/components/filters/sort-filter-select";
import { InventoryEntityFilters } from "@/components/inventory/inventory-entity-filters";
import {
	RecordMovementForm,
	type RecordMovementPrefill,
} from "@/components/inventory/record-movement-form";
import { TransferFilterBanner } from "@/components/inventory/transfer-filter-banner";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import {
	movementDetailUrl,
	transferMovementsListUrl,
} from "@/lib/inventory/movement-urls";
import { filtersAreDirty, withPaginationParams } from "@/lib/nuqs/filter-utils";
import { useInventoryMovementFilters } from "@/lib/nuqs/inventory-movement-filters";
import { useRecordMovementPrefill } from "@/lib/nuqs/record-movement-prefill";
import { useListPage } from "@/lib/nuqs/use-list-page";
import { canManageInventory } from "@/lib/permissions";
import { inventoryMovementsListQueryOptions } from "@/lib/queries/inventory";
import { formatDate } from "@/lib/utils";

const sortOptions = [
	{ value: "__default__", label: "Default ordering" },
	{ value: "-id", label: "ID descending" },
	{ value: "id", label: "ID ascending" },
	{ value: "created_at", label: "Oldest first" },
	{ value: "-created_at", label: "Newest first (explicit)" },
] as const;

const kindFilterOptions = [
	{ value: "__all__", label: "All kinds" },
	{ value: "receipt", label: "Receipt" },
	{ value: "adjustment", label: "Adjustment" },
	{ value: "transfer", label: "Transfer" },
] as const;

export default function InventoryMovementsPage() {
	const { permissions: permissionList } = usePermissions();
	const canRecord = canManageInventory(permissionList);
	const { goToPage, page, perPage, resetPage, setPerPage } = useListPage();
	const {
		applied,
		apiQuery: filterQuery,
		applyFilters: applyFiltersBase,
		clearTransferFilter,
		draft,
		resetFilters: resetFiltersBase,
		setDraft,
	} = useInventoryMovementFilters();
	const recordPrefill = useRecordMovementPrefill();
	const formPrefill: RecordMovementPrefill | undefined =
		recordPrefill.hasPrefill
			? {
					kind: recordPrefill.kind === "receipt" ? "receipt" : "adjustment",
					locationId: recordPrefill.locationId,
					productId: recordPrefill.productId,
				}
			: undefined;
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

	const listQuery = useQuery({
		...inventoryMovementsListQueryOptions(apiQuery),
		placeholderData: (previousData) => previousData,
	});

	const showPending = useDelayedPending(listQuery.isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">
						Inventory movements
					</h1>
					<p className="text-muted-foreground text-sm">
						Ledger of stock changes (receipts, adjustments, transfers).
					</p>
				</div>
				<Button asChild size="sm" variant="outline">
					<Link href="/inventory/balances">Balances</Link>
				</Button>
			</div>

			<RecordMovementForm
				enabled={canRecord}
				onPrefillApplied={recordPrefill.clearPrefill}
				prefill={formPrefill}
			/>

			{applied.correlationId ? (
				<TransferFilterBanner
					correlationId={applied.correlationId}
					onClear={() => {
						clearTransferFilter();
						resetPage();
					}}
				/>
			) : null}

			<Card>
				<ListFilterBar
					isDirty={isDirty}
					onApply={applyFilters}
					onReset={resetFilters}
				>
					<InventoryEntityFilters draft={draft} setDraft={setDraft} />
					<FilterControl label="Kind">
						<Select
							onValueChange={(value) => {
								setDraft((current) => ({ ...current, kind: value }));
							}}
							value={draft.kind}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Any kind" />
							</SelectTrigger>
							<SelectContent>
								{kindFilterOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FilterControl>
					<FilterControl label="Transfer ID">
						<Input
							className="w-full"
							onChange={(event) => {
								setDraft((current) => ({
									...current,
									correlationId: event.target.value,
								}));
							}}
							placeholder="Correlation ID"
							value={draft.correlationId}
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
						<LoadingState title="Loading movements" />
					) : null}
					{listQuery.isError ? (
						<ErrorState
							error={listQuery.error}
							title="Could not load movements"
						/>
					) : null}
					{listQuery.data ? (
						<div className="flex flex-col gap-3">
							<ListPagination
								itemLabel="movement"
								meta={listQuery.data.meta}
								onPageChange={goToPage}
								onPerPageChange={setPerPage}
								perPage={perPage}
							/>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>ID</TableHead>
											<TableHead>When</TableHead>
											<TableHead>Kind</TableHead>
											<TableHead>Warehouse</TableHead>
											<TableHead>Location</TableHead>
											<TableHead>Product</TableHead>
											<TableHead className="text-right">Δ Qty</TableHead>
											<TableHead>Transfer ref</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{listQuery.data.data.length ? (
											listQuery.data.data.map((row) => (
												<TableRow key={row.id}>
													<TableCell>
														<Link
															className="font-medium text-primary underline-offset-4 hover:underline"
															href={movementDetailUrl(row.id)}
														>
															{row.id}
														</Link>
													</TableCell>
													<TableCell className="whitespace-nowrap text-muted-foreground text-xs">
														{formatDate(row.created_at)}
													</TableCell>
													<TableCell>{row.kind}</TableCell>
													<TableCell>
														{row.warehouse?.name ?? row.warehouse_id}
													</TableCell>
													<TableCell>
														{row.location?.code ?? row.location_id}
													</TableCell>
													<TableCell>
														{row.product
															? `${row.product.sku}`
															: row.product_id}
													</TableCell>
													<TableCell className="text-right font-medium tabular-nums">
														{row.quantity_delta}
													</TableCell>
													<TableCell className="text-xs">
														{row.transfer_correlation_id ? (
															<Link
																className="font-medium text-primary underline-offset-4 hover:underline"
																href={transferMovementsListUrl(
																	row.transfer_correlation_id,
																)}
																title={row.transfer_correlation_id}
															>
																View transfer
															</Link>
														) : (
															<span className="text-muted-foreground">—</span>
														)}
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													className="text-muted-foreground"
													colSpan={8}
												>
													No movements for the current filters.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</div>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}
