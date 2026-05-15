"use client";

import { useQuery } from "@tanstack/react-query";
import { WarehouseIcon } from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { canViewInventory, canViewWarehouses } from "@/lib/permissions";
import { warehousesListQueryOptions } from "@/lib/queries/warehouses";

const PREVIEW_LIMIT = 5;

type DashboardWarehousesPanelProps = {
	permissions: readonly string[];
};

/**
 * Shown when the user can see warehouses but not inventory (sidebar layout fallback).
 */
export function DashboardWarehousesPanel({
	permissions,
}: DashboardWarehousesPanelProps) {
	const showWarehouses = canViewWarehouses(permissions);
	const showInventory = canViewInventory(permissions);
	const shouldShow = showWarehouses && !showInventory;

	const warehousesQuery = useQuery({
		...warehousesListQueryOptions(),
		enabled: shouldShow,
	});
	const rows = (warehousesQuery.data?.data ?? []).slice(0, PREVIEW_LIMIT);

	if (!shouldShow) {
		return null;
	}

	return (
		<Card className="border-border/80">
			<CardHeader className="flex flex-row items-start justify-between gap-3">
				<div className="flex flex-col gap-1">
					<CardTitle className="text-base">Your warehouses</CardTitle>
					<CardDescription>Sites configured for this tenant.</CardDescription>
				</div>
				<div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
					<WarehouseIcon aria-hidden className="size-4" />
				</div>
			</CardHeader>
			<CardContent>
				{warehousesQuery.isPending ? (
					<LoadingState title="Loading warehouses" />
				) : null}
				{warehousesQuery.isError ? (
					<ErrorState
						error={warehousesQuery.error}
						onRetry={() => {
							void warehousesQuery.refetch();
						}}
						title="Could not load warehouses"
					/>
				) : null}
				{warehousesQuery.data ? (
					<div className="flex flex-col gap-3">
						{rows.length === 0 ? (
							<p className="text-muted-foreground text-sm">
								No warehouses yet. Create one to start adding locations.
							</p>
						) : (
							<ul className="divide-y divide-border rounded-lg border border-border/80">
								{rows.map((warehouse) => (
									<li className="px-3 py-2.5 text-sm" key={warehouse.id}>
										<p className="font-medium">{warehouse.name}</p>
										<p className="text-muted-foreground text-xs">
											{warehouse.code ?? "No code"}
										</p>
									</li>
								))}
							</ul>
						)}
						<Button
							asChild
							className="w-full sm:w-auto"
							size="sm"
							variant="outline"
						>
							<Link href="/warehouses">Manage warehouses</Link>
						</Button>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
