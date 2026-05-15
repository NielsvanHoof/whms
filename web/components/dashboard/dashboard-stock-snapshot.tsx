"use client";

import { useQuery } from "@tanstack/react-query";
import { PackageIcon } from "lucide-react";
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
import { canViewInventory } from "@/lib/permissions";
import { inventoryBalancesListQueryOptions } from "@/lib/queries/inventory";

const PREVIEW_LIMIT = 6;

type DashboardStockSnapshotProps = {
	permissions: readonly string[];
};

export function DashboardStockSnapshot({
	permissions,
}: DashboardStockSnapshotProps) {
	const enabled = canViewInventory(permissions);

	const balancesQuery = useQuery({
		...inventoryBalancesListQueryOptions({ sort: ["-quantity"] }),
		enabled,
	});

	if (!enabled) {
		return null;
	}

	const rows = (balancesQuery.data?.data ?? []).slice(0, PREVIEW_LIMIT);

	return (
		<Card className="border-border/80">
			<CardHeader className="flex flex-row items-start justify-between gap-3">
				<div className="flex flex-col gap-1">
					<CardTitle className="text-base">Top stock levels</CardTitle>
					<CardDescription>
						Highest on-hand quantities in the tenant.
					</CardDescription>
				</div>
				<div className="flex size-9 items-center justify-center rounded-md bg-muted">
					<PackageIcon aria-hidden className="size-4 text-muted-foreground" />
				</div>
			</CardHeader>
			<CardContent>
				{balancesQuery.isPending ? (
					<LoadingState title="Loading balances" />
				) : null}
				{balancesQuery.isError ? (
					<ErrorState
						error={balancesQuery.error}
						onRetry={() => {
							void balancesQuery.refetch();
						}}
						title="Could not load balances"
					/>
				) : null}
				{balancesQuery.data ? (
					<div className="flex flex-col gap-3">
						{rows.length === 0 ? (
							<p className="text-muted-foreground text-sm">
								No stock on hand yet. Record a receipt to create balances.
							</p>
						) : (
							<ul className="divide-y divide-border rounded-lg border border-border/80">
								{rows.map((row) => (
									<li key={row.id}>
										<Link
											className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
											href={`/inventory/balances/${row.id}`}
										>
											<div className="min-w-0 flex-1">
												<p className="truncate font-medium">
													{row.product?.sku ?? `Product ${row.product_id}`}
												</p>
												<p className="truncate text-muted-foreground text-xs">
													{row.location?.code ?? row.location_id}
													{row.warehouse?.name
														? ` · ${row.warehouse.name}`
														: ""}
												</p>
											</div>
											<span className="shrink-0 font-semibold tabular-nums">
												{row.quantity}
											</span>
										</Link>
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
							<Link href="/inventory/balances">All balances</Link>
						</Button>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
