"use client";

import { useQueries } from "@tanstack/react-query";
import {
	MapPinIcon,
	PackageIcon,
	ShoppingBagIcon,
	WarehouseIcon,
} from "lucide-react";

import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import {
	canViewInventory,
	canViewLocations,
	canViewProducts,
	canViewWarehouses,
} from "@/lib/permissions";
import { inventoryBalancesListQueryOptions } from "@/lib/queries/inventory";
import { locationsListQueryOptions } from "@/lib/queries/locations";
import { productsListQueryOptions } from "@/lib/queries/products";
import { warehousesListQueryOptions } from "@/lib/queries/warehouses";

type DashboardStatsGridProps = {
	permissions: readonly string[];
};

export function DashboardStatsGrid({ permissions }: DashboardStatsGridProps) {
	const showWarehouses = canViewWarehouses(permissions);
	const showLocations = canViewLocations(permissions);
	const showProducts = canViewProducts(permissions);
	const showInventory = canViewInventory(permissions);

	const [warehouses, locations, products, balances] = useQueries({
		queries: [
			{
				...warehousesListQueryOptions(),
				enabled: showWarehouses,
			},
			{
				...locationsListQueryOptions(),
				enabled: showLocations,
			},
			{
				...productsListQueryOptions(),
				enabled: showProducts,
			},
			{
				...inventoryBalancesListQueryOptions(),
				enabled: showInventory,
			},
		],
	});

	const visibleCount =
		Number(showWarehouses) +
		Number(showLocations) +
		Number(showProducts) +
		Number(showInventory);

	if (visibleCount === 0) {
		return (
			<p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-muted-foreground text-sm">
				No resource permissions are assigned to your account yet. Contact an
				administrator if you need access.
			</p>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{showWarehouses ? (
				<DashboardStatCard
					description="Sites in your tenant"
					href="/warehouses"
					icon={WarehouseIcon}
					isError={warehouses.isError}
					isLoading={warehouses.isPending}
					error={warehouses.error}
					onRetry={() => {
						void warehouses.refetch();
					}}
					title="Warehouses"
					value={warehouses.data?.meta.total ?? null}
				/>
			) : null}
			{showLocations ? (
				<DashboardStatCard
					description="Bins, aisles, and zones"
					href="/locations"
					icon={MapPinIcon}
					isError={locations.isError}
					isLoading={locations.isPending}
					error={locations.error}
					onRetry={() => {
						void locations.refetch();
					}}
					title="Locations"
					value={locations.data?.meta.total ?? null}
				/>
			) : null}
			{showProducts ? (
				<DashboardStatCard
					description="SKU catalog entries"
					href="/products"
					icon={ShoppingBagIcon}
					isError={products.isError}
					isLoading={products.isPending}
					error={products.error}
					onRetry={() => {
						void products.refetch();
					}}
					title="Products"
					value={products.data?.meta.total ?? null}
				/>
			) : null}
			{showInventory ? (
				<DashboardStatCard
					description="Location × product rows"
					href="/inventory/balances"
					icon={PackageIcon}
					isError={balances.isError}
					isLoading={balances.isPending}
					error={balances.error}
					onRetry={() => {
						void balances.refetch();
					}}
					title="Stock balances"
					value={balances.data?.meta.total ?? null}
				/>
			) : null}
		</div>
	);
}
