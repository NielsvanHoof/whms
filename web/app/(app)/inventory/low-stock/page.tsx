"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";

import { ListPagination } from "@/components/filters/list-pagination";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { RefreshingIndicator } from "@/components/query/refreshing-indicator";
import { TableEmptyState } from "@/components/query/table-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useListPage } from "@/lib/nuqs/use-list-page";
import { canManageInventory } from "@/lib/permissions";
import { lowStockListQueryOptions } from "@/lib/queries/reorder-points";

export default function LowStockPage() {
	const permissions = usePermissions();
	const { goToPage, page, perPage, setPerPage } = useListPage();
	const canManage = canManageInventory(permissions.permissions);

	const listQuery = useQuery({
		...lowStockListQueryOptions({ page, per_page: perPage }),
		placeholderData: (previousData) => previousData,
	});

	const showPending = useDelayedPending(listQuery.isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-2xl tracking-tight">Low stock</h1>
					<p className="text-muted-foreground text-sm">
						Products at or below their reorder threshold, per location.
					</p>
				</div>
				<div className="flex items-center gap-2">
					{canManage ? (
						<Button asChild size="sm" variant="outline">
							<Link href="/inventory/reorder-points">Manage thresholds</Link>
						</Button>
					) : null}
				</div>
			</div>

			<Card>
				<CardContent className="pt-6">
					{showPending && !listQuery.data ? (
						<LoadingState title="Loading low stock" />
					) : null}
					{listQuery.isError ? (
						<ErrorState
							error={listQuery.error}
							onRetry={() => {
								void listQuery.refetch();
							}}
							title="Could not load low stock"
						/>
					) : null}
					{listQuery.data ? (
						<div className="relative flex flex-col gap-3">
							{listQuery.isFetching && !showPending ? (
								<RefreshingIndicator />
							) : null}
							<ListPagination
								itemLabel="low-stock item"
								meta={listQuery.data.meta}
								onPageChange={goToPage}
								onPerPageChange={setPerPage}
								perPage={perPage}
							/>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Product</TableHead>
										<TableHead>Location</TableHead>
										<TableHead className="text-right">On hand</TableHead>
										<TableHead className="text-right">Threshold</TableHead>
										<TableHead className="text-right">Shortage</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{listQuery.data.data.length ? (
										listQuery.data.data.map((row) => (
											<TableRow key={row.id}>
												<TableCell className="font-medium">
													{row.product
														? `${row.product.sku} — ${row.product.name}`
														: row.product_id}
												</TableCell>
												<TableCell>
													{row.location?.code ?? row.location_id}
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{row.on_hand_quantity}
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{row.quantity}
												</TableCell>
												<TableCell className="text-right">
													<Badge variant="destructive">-{row.shortage}</Badge>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableEmptyState
											colSpan={5}
											description="Every reorder point is currently at or above its threshold."
											icon={AlertTriangleIcon}
											title="No low stock items"
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
