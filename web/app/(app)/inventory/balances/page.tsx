"use client";

import { useQuery } from "@tanstack/react-query";
import { DownloadIcon, PackageSearchIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ListFilterBar } from "@/components/filters/list-filter-bar";
import { ListPagination } from "@/components/filters/list-pagination";
import { SortFilterSelect } from "@/components/filters/sort-filter-select";
import { InventoryEntityFilters } from "@/components/inventory/inventory-entity-filters";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { RefreshingIndicator } from "@/components/query/refreshing-indicator";
import { TableEmptyState } from "@/components/query/table-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDelayedPending } from "@/hooks/use-delayed-pending";
import { exportInventoryBalancesCsv } from "@/lib/api/inventory";
import { downloadCsvBlob } from "@/lib/export/download-csv";
import { filtersAreDirty, withPaginationParams } from "@/lib/nuqs/filter-utils";
import { useInventoryBalanceFilters } from "@/lib/nuqs/inventory-balance-filters";
import { useListPage } from "@/lib/nuqs/use-list-page";
import { inventoryBalancesListQueryOptions } from "@/lib/queries/inventory";
import { toastApiError } from "@/lib/toast";

const sortOptions = [
	{ value: "__default__", label: "Default (id ascending)" },
	{ value: "-quantity", label: "Quantity high → low" },
	{ value: "quantity", label: "Quantity low → high" },
	{ value: "-updated_at", label: "Recently updated" },
	{ value: "updated_at", label: "Oldest update first" },
] as const;

export default function InventoryBalancesPage() {
	const [exporting, setExporting] = useState(false);
	const { goToPage, page, perPage, resetPage, setPerPage } = useListPage();
	const {
		applied,
		apiQuery: filterQuery,
		applyFilters: applyFiltersBase,
		draft,
		resetFilters: resetFiltersBase,
		setDraft,
	} = useInventoryBalanceFilters();
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
		...inventoryBalancesListQueryOptions(apiQuery),
		placeholderData: (previousData) => previousData,
	});

	const showPending = useDelayedPending(listQuery.isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	const handleExport = async () => {
		setExporting(true);
		try {
			const blob = await exportInventoryBalancesCsv(filterQuery);
			downloadCsvBlob(blob, `inventory-balances-${Date.now()}.csv`);
		} catch (error) {
			void toastApiError(error, "Could not export balances.");
		} finally {
			setExporting(false);
		}
	};

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<h1 className="font-semibold text-2xl tracking-tight">
							Inventory balances
						</h1>
						<p className="text-muted-foreground text-sm">
							On-hand quantity per warehouse, location, and product.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							disabled={exporting}
							onClick={() => {
								void handleExport();
							}}
							size="sm"
							type="button"
							variant="outline"
						>
							{exporting ? (
								<Spinner
									aria-hidden
									className="size-4"
									data-icon="inline-start"
								/>
							) : (
								<DownloadIcon data-icon="inline-start" />
							)}
							Export CSV
						</Button>
						<Button asChild size="sm" variant="outline">
							<Link href="/inventory/movements">Movement history</Link>
						</Button>
					</div>
				</div>
			</div>

			<Card>
				<ListFilterBar
					isDirty={isDirty}
					onApply={applyFilters}
					onReset={resetFilters}
				>
					<InventoryEntityFilters draft={draft} setDraft={setDraft} />
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
						<LoadingState title="Loading balances" />
					) : null}
					{listQuery.isError ? (
						<ErrorState
							error={listQuery.error}
							title="Could not load inventory balances"
						/>
					) : null}
					{listQuery.data ? (
						<div className="relative flex flex-col gap-3">
							{listQuery.isFetching && !showPending ? (
								<RefreshingIndicator />
							) : null}
							<ListPagination
								itemLabel="balance"
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
										<TableHead>Location</TableHead>
										<TableHead>Product</TableHead>
										<TableHead className="text-right">Qty</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{listQuery.data.data.length ? (
										listQuery.data.data.map((row) => (
											<TableRow key={row.id}>
												<TableCell>
													<Link
														className="text-primary underline-offset-4 hover:underline"
														href={`/inventory/balances/${row.id}`}
													>
														{row.id}
													</Link>
												</TableCell>
												<TableCell>
													{row.warehouse?.name ?? row.warehouse_id}
												</TableCell>
												<TableCell>
													{row.location?.code ?? row.location_id}
												</TableCell>
												<TableCell>
													{row.product
														? `${row.product.sku} — ${row.product.name}`
														: row.product_id}
												</TableCell>
												<TableCell className="text-right font-medium tabular-nums">
													{row.quantity}
												</TableCell>
											</TableRow>
										))
									) : (
										<TableEmptyState
											colSpan={5}
											description="Try adjusting the filters or record a receipt to create stock."
											icon={PackageSearchIcon}
											title="No balances found"
										/>
									)}
								</TableBody>
							</Table>
						</div>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}
