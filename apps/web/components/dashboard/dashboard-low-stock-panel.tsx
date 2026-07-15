"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { canViewInventory } from "@/lib/permissions";
import { lowStockListQueryOptions } from "@/lib/queries/reorder-points";

const PREVIEW_LIMIT = 6;

type DashboardLowStockPanelProps = {
	permissions: readonly string[];
};

export function DashboardLowStockPanel({
	permissions,
}: DashboardLowStockPanelProps) {
	const enabled = canViewInventory(permissions);

	const lowStockQuery = useQuery({
		...lowStockListQueryOptions({ sort: ["-quantity"] }),
		enabled,
	});

	if (!enabled) {
		return null;
	}

	const rows = (lowStockQuery.data?.data ?? []).slice(0, PREVIEW_LIMIT);
	const total = lowStockQuery.data?.meta.total ?? 0;

	return (
		<Card className="border-border/80">
			<CardHeader className="flex flex-row items-start justify-between gap-3">
				<div className="flex flex-col gap-1">
					<CardTitle className="text-base">Low stock</CardTitle>
					<CardDescription>
						Products at or below their reorder threshold.
					</CardDescription>
				</div>
				<div className="flex size-9 items-center justify-center rounded-md bg-destructive/10">
					<AlertTriangleIcon aria-hidden className="size-4 text-destructive" />
				</div>
			</CardHeader>
			<CardContent>
				{lowStockQuery.isPending ? (
					<LoadingState title="Loading low stock" />
				) : null}
				{lowStockQuery.isError ? (
					<ErrorState
						error={lowStockQuery.error}
						onRetry={() => {
							void lowStockQuery.refetch();
						}}
						title="Could not load low stock"
					/>
				) : null}
				{lowStockQuery.data ? (
					<div className="flex flex-col gap-3">
						{rows.length === 0 ? (
							<p className="text-muted-foreground text-sm">
								Nothing is low on stock right now.
							</p>
						) : (
							<ul className="divide-y divide-border rounded-lg border border-border/80">
								{rows.map((row) => (
									<li key={row.id}>
										<Link
											className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
											href="/inventory/low-stock"
										>
											<div className="min-w-0 flex-1">
												<p className="truncate font-medium">
													{row.product?.sku ?? `Product ${row.product_id}`}
												</p>
												<p className="truncate text-muted-foreground text-xs">
													{row.location?.code ?? row.location_id}
													{" · on hand "}
													{row.on_hand_quantity} / {row.quantity}
												</p>
											</div>
											<Badge className="shrink-0" variant="destructive">
												-{row.shortage}
											</Badge>
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
							<Link href="/inventory/low-stock">
								{total > 0 ? `All low stock (${total})` : "All low stock"}
							</Link>
						</Button>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
