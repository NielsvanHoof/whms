"use client";

import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import Link from "next/link";

import { RecordMovementForm } from "@/components/inventory/record-movement-form";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useInventoryMovementFilters } from "@/lib/nuqs/inventory-movement-filters";
import { canManageInventory } from "@/lib/permissions";
import { inventoryMovementsListQueryOptions } from "@/lib/queries/inventory";

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

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return date.toLocaleString();
}

export default function InventoryMovementsPage() {
	const { permissions: permissionList } = usePermissions();
	const canRecord = canManageInventory(permissionList);
	const { apiQuery, applyFilters, draft, resetFilters, setDraft } =
		useInventoryMovementFilters();

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

			<RecordMovementForm enabled={canRecord} />

			<Card>
				<CardHeader>
					<CardTitle>Filters</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end"
						onSubmit={(event) => {
							event.preventDefault();
							applyFilters();
						}}
					>
						<Input
							onChange={(event) => {
								setDraft((current) => ({
									...current,
									warehouseId: event.target.value,
								}));
							}}
							placeholder="Warehouse ID"
							value={draft.warehouseId}
						/>
						<Input
							onChange={(event) => {
								setDraft((current) => ({
									...current,
									locationId: event.target.value,
								}));
							}}
							placeholder="Location ID"
							value={draft.locationId}
						/>
						<Input
							onChange={(event) => {
								setDraft((current) => ({
									...current,
									productId: event.target.value,
								}));
							}}
							placeholder="Product ID"
							value={draft.productId}
						/>
						<Select
							onValueChange={(value) => {
								setDraft((current) => ({ ...current, kind: value }));
							}}
							value={draft.kind}
						>
							<SelectTrigger className="w-full md:w-44">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{kindFilterOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Input
							onChange={(event) => {
								setDraft((current) => ({
									...current,
									correlationId: event.target.value,
								}));
							}}
							placeholder="Transfer correlation ID"
							value={draft.correlationId}
						/>
						<Select
							onValueChange={(value) => {
								setDraft((current) => ({ ...current, sort: value }));
							}}
							value={draft.sort}
						>
							<SelectTrigger className="w-full md:w-52">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{sortOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button type="submit">
							<SearchIcon data-icon="inline-start" />
							Apply
						</Button>
						<Button onClick={resetFilters} type="button" variant="outline">
							Reset
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card>
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
							<p className="text-muted-foreground text-sm">
								{listQuery.data.meta.total} movement
								{listQuery.data.meta.total === 1 ? "" : "s"} (page{" "}
								{listQuery.data.meta.current_page} of{" "}
								{listQuery.data.meta.last_page})
							</p>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
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
													<TableCell className="max-w-[140px] truncate font-mono text-xs">
														{row.transfer_correlation_id || "—"}
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													className="text-muted-foreground"
													colSpan={7}
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
