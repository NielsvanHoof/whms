"use client";

import { useQuery } from "@tanstack/react-query";

import { WarehouseSummaryWidget } from "@/components/dashboard/warehouse-summary-widget";
import { useDelayedPending } from "@/hooks/use-delayed-pending";
import { warehousesListQueryOptions } from "@/lib/queries/warehouses";

export default function DashboardPage() {
	const {
		data: warehouses,
		error,
		isFetching,
		isError,
		isPending,
		refetch,
	} = useQuery(warehousesListQueryOptions());

	const showPending = useDelayedPending(isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl tracking-tight">Overview</h1>
				<p className="text-muted-foreground text-sm">
					A quick read on the tenant's warehouse setup.
				</p>
			</div>

			<WarehouseSummaryWidget
				error={error}
				isError={isError}
				isPending={showPending}
				isRetrying={isFetching && !showPending}
				onRetry={() => {
					void refetch();
				}}
				warehouses={warehouses}
			/>
		</div>
	);
}
