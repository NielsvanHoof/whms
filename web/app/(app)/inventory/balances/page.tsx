"use client";

import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import Link from "next/link";

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
import { useInventoryBalanceFilters } from "@/lib/nuqs/inventory-balance-filters";
import { inventoryBalancesListQueryOptions } from "@/lib/queries/inventory";

const sortOptions = [
	{ value: "__default__", label: "Default (id ascending)" },
	{ value: "-quantity", label: "Quantity high → low" },
	{ value: "quantity", label: "Quantity low → high" },
	{ value: "-updated_at", label: "Recently updated" },
	{ value: "updated_at", label: "Oldest update first" },
] as const;

export default function InventoryBalancesPage() {
	const { apiQuery, applyFilters, draft, resetFilters, setDraft } =
		useInventoryBalanceFilters();

	const listQuery = useQuery({
		...inventoryBalancesListQueryOptions(apiQuery),
		placeholderData: (previousData) => previousData,
	});

	const showPending = useDelayedPending(listQuery.isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

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
					<Button asChild size="sm" variant="outline">
						<Link href="/inventory/movements">Movement history</Link>
					</Button>
				</div>
			</div>

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
								setDraft((current) => ({ ...current, sort: value }));
							}}
							value={draft.sort}
						>
							<SelectTrigger className="w-full md:w-56">
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
						<LoadingState title="Loading balances" />
					) : null}
					{listQuery.isError ? (
						<ErrorState
							error={listQuery.error}
							title="Could not load inventory balances"
						/>
					) : null}
					{listQuery.data ? (
						<div className="flex flex-col gap-3">
							<p className="text-muted-foreground text-sm">
								{listQuery.data.meta.total} balance
								{listQuery.data.meta.total === 1 ? "" : "es"} (page{" "}
								{listQuery.data.meta.current_page} of{" "}
								{listQuery.data.meta.last_page})
							</p>
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
										<TableRow>
											<TableCell className="text-muted-foreground" colSpan={5}>
												No balances for the current filters.
											</TableCell>
										</TableRow>
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
