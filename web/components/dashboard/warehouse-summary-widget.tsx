import { WarehouseIcon } from "lucide-react";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { WarehousesIndexResponse } from "@/lib/api/warehouses";

type WarehouseSummaryWidgetProps = {
	warehouses?: WarehousesIndexResponse;
	error?: unknown;
	isError: boolean;
	isPending: boolean;
	isRetrying?: boolean;
	onRetry?: () => void;
};

/**
 * Small dashboard widget fed by the warehouses index query.
 * It keeps API state handling close to the visual summary.
 */
export function WarehouseSummaryWidget({
	warehouses,
	error,
	isError,
	isPending,
	isRetrying = false,
	onRetry,
}: WarehouseSummaryWidgetProps) {
	const rows = warehouses?.data ?? [];
	const total = warehouses?.meta.total ?? rows.length;
	const pageCount = warehouses?.meta.last_page ?? 0;
	const latestWarehouse = rows[0];

	return (
		<Card className="max-w-xl border-border/80">
			<CardHeader className="flex flex-row items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<CardTitle>Warehouses</CardTitle>
					<CardDescription>
						Tenant locations available to this account.
					</CardDescription>
				</div>
				<div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
					<WarehouseIcon aria-hidden className="size-5" />
				</div>
			</CardHeader>
			<CardContent className="flex min-h-52 flex-col gap-5">
				{isPending ? (
					<LoadingState
						description="Fetching tenant locations from the API."
						title="Loading warehouses"
					/>
				) : null}

				{isError ? (
					<ErrorState
						description="The warehouse overview could not be fetched."
						error={error}
						isRetrying={isRetrying}
						onRetry={onRetry}
						title="Could not load warehouses"
					/>
				) : null}

				{!isPending && !isError ? (
					<>
						<div className="flex items-end gap-3">
							<div className="font-semibold text-4xl tracking-tight">
								{total}
							</div>
							<div className="pb-1 text-muted-foreground text-sm">
								total warehouse{total === 1 ? "" : "s"}
							</div>
						</div>

						<div className="grid gap-3 rounded-lg bg-muted/40 p-4 text-sm sm:grid-cols-2">
							<div className="flex flex-col gap-1">
								<span className="text-muted-foreground">Loaded on page</span>
								<span className="font-medium">{rows.length}</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-muted-foreground">Pages</span>
								<span className="font-medium">{pageCount}</span>
							</div>
						</div>

						<div className="flex flex-col gap-1 text-sm">
							<span className="text-muted-foreground">First warehouse</span>
							<span className="font-medium">
								{latestWarehouse
									? `${latestWarehouse.name}${latestWarehouse.code ? ` (${latestWarehouse.code})` : ""}`
									: "No warehouses yet"}
							</span>
						</div>
					</>
				) : null}
			</CardContent>
		</Card>
	);
}
