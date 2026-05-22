"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRightIcon } from "lucide-react";
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
import { inventoryMovementsListQueryOptions } from "@/lib/queries/inventory";
import { formatWhen } from "@/lib/utils";

const PREVIEW_LIMIT = 6;

function kindLabel(kind: string): string {
	return kind.charAt(0).toUpperCase() + kind.slice(1);
}

type DashboardRecentMovementsProps = {
	permissions: readonly string[];
};

export function DashboardRecentMovements({
	permissions,
}: DashboardRecentMovementsProps) {
	const enabled = canViewInventory(permissions);

	const movementsQuery = useQuery({
		...inventoryMovementsListQueryOptions({ sort: ["-created_at"] }),
		enabled,
	});

	if (!enabled) {
		return null;
	}

	const rows = (movementsQuery.data?.data ?? []).slice(0, PREVIEW_LIMIT);

	return (
		<Card className="border-border/80">
			<CardHeader className="flex flex-row items-start justify-between gap-3">
				<div className="flex flex-col gap-1">
					<CardTitle className="text-base">Recent movements</CardTitle>
					<CardDescription>Latest stock changes in the ledger.</CardDescription>
				</div>
				<div className="flex size-9 items-center justify-center rounded-md bg-muted">
					<ArrowLeftRightIcon
						aria-hidden
						className="size-4 text-muted-foreground"
					/>
				</div>
			</CardHeader>
			<CardContent>
				{movementsQuery.isPending ? (
					<LoadingState title="Loading movements" />
				) : null}
				{movementsQuery.isError ? (
					<ErrorState
						error={movementsQuery.error}
						onRetry={() => {
							void movementsQuery.refetch();
						}}
						title="Could not load movements"
					/>
				) : null}
				{movementsQuery.data ? (
					<div className="flex flex-col gap-3">
						{rows.length === 0 ? (
							<p className="text-muted-foreground text-sm">
								No movements recorded yet. Post a receipt from the movements
								page when you are ready.
							</p>
						) : (
							<ul className="divide-y divide-border rounded-lg border border-border/80">
								{rows.map((row) => (
									<li
										className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
										key={row.id}
									>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium">
												{row.product?.sku ?? `Product ${row.product_id}`}
												<span className="font-normal text-muted-foreground">
													{" "}
													· {row.location?.code ?? row.location_id}
												</span>
											</p>
											<p className="text-muted-foreground text-xs">
												{kindLabel(row.kind)} · {formatWhen(row.created_at)}
											</p>
										</div>
										<span
											className={
												row.quantity_delta >= 0
													? "shrink-0 font-medium text-emerald-700 tabular-nums dark:text-emerald-400"
													: "shrink-0 font-medium text-amber-800 tabular-nums dark:text-amber-400"
											}
										>
											{row.quantity_delta > 0 ? "+" : ""}
											{row.quantity_delta}
										</span>
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
							<Link href="/inventory/movements">View all movements</Link>
						</Button>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
