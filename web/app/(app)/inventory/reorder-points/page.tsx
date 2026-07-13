"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangleIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import { ListPagination } from "@/components/filters/list-pagination";
import { ResourceListCard } from "@/components/list/resource-list-card";
import { ResourceListQueryState } from "@/components/list/resource-list-query-state";
import { ResourcePage } from "@/components/list/resource-page";
import { TableEmptyState } from "@/components/query/table-empty-state";
import { TableRowActions } from "@/components/table/table-row-actions";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDelayedPending } from "@/hooks/use-delayed-pending";
import { useDeleteRowMutation } from "@/hooks/use-delete-row-mutation";
import { usePermissions } from "@/hooks/use-permissions";
import { useListPage } from "@/lib/nuqs/use-list-page";
import { reorderPointListResource } from "@/lib/resources/reorder-points";

export default function ReorderPointsPage() {
	const permissions = usePermissions();
	const { goToPage, page, perPage, setPerPage } = useListPage();

	const permList = permissions.permissions;
	const canView = reorderPointListResource.canView(permList);
	const canManage = reorderPointListResource.canManage(permList);

	const listQuery = useQuery({
		...reorderPointListResource.listQueryOptions({ page, per_page: perPage }),
		placeholderData: (previousData) => previousData,
	});

	const showPending = useDelayedPending(listQuery.isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	const { deleteRow, isDeleting } = useDeleteRowMutation({
		deleteFn: reorderPointListResource.deleteFn,
		invalidateQueryKey: reorderPointListResource.invalidateQueryKey,
		successMessage: reorderPointListResource.deleteSuccessMessage,
		errorMessage: reorderPointListResource.deleteErrorMessage,
	});

	return (
		<ResourcePage
			accessDeniedDescription={reorderPointListResource.accessDeniedDescription}
			action={
				<div className="flex items-center gap-2">
					<Button asChild size="sm" variant="outline">
						<Link href="/inventory/low-stock">
							<AlertTriangleIcon data-icon="inline-start" />
							Low stock
						</Link>
					</Button>
					{canManage ? (
						<Button asChild size="sm" variant="outline">
							<Link href={reorderPointListResource.createHref}>
								<PlusIcon data-icon="inline-start" />
								{reorderPointListResource.createLabel}
							</Link>
						</Button>
					) : null}
				</div>
			}
			canView={canView}
			description={reorderPointListResource.description}
			title={reorderPointListResource.title}
		>
			<ResourceListCard filters={null}>
				<ResourceListQueryState
					data={listQuery.data}
					error={listQuery.error}
					errorDescription={reorderPointListResource.errorDescription}
					errorTitle={reorderPointListResource.errorTitle}
					isError={listQuery.isError}
					isFetching={listQuery.isFetching}
					isPendingVisible={showPending}
					loadingDescription={reorderPointListResource.loadingDescription}
					loadingTitle={reorderPointListResource.loadingTitle}
					onRetry={() => {
						void listQuery.refetch();
					}}
				>
					{(reorderPoints) => (
						<>
							<ListPagination
								itemLabel={reorderPointListResource.itemLabel}
								meta={reorderPoints.meta}
								onPageChange={goToPage}
								onPerPageChange={setPerPage}
								perPage={perPage}
							/>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Product</TableHead>
										<TableHead>Location</TableHead>
										<TableHead className="text-right">Threshold</TableHead>
										{canManage ? (
											<TableHead className="text-right">Actions</TableHead>
										) : null}
									</TableRow>
								</TableHeader>
								<TableBody>
									{reorderPoints.data.length ? (
										reorderPoints.data.map((reorderPoint) => (
											<TableRow key={reorderPoint.id}>
												<TableCell>{reorderPoint.id}</TableCell>
												<TableCell className="font-medium">
													{reorderPoint.product
														? `${reorderPoint.product.sku} — ${reorderPoint.product.name}`
														: reorderPoint.product_id}
												</TableCell>
												<TableCell>
													{reorderPoint.location?.code ??
														reorderPoint.location_id}
												</TableCell>
												<TableCell className="text-right font-medium tabular-nums">
													{reorderPoint.quantity}
												</TableCell>
												{canManage ? (
													<TableCell className="text-right">
														<TableRowActions
															canDelete={canManage}
															canEdit={canManage}
															deleteDescription={
																<>
																	This permanently removes the reorder point for{" "}
																	<span className="font-medium text-foreground">
																		{reorderPoint.product?.sku ??
																			reorderPoint.product_id}
																	</span>{" "}
																	at{" "}
																	{reorderPoint.location?.code ??
																		reorderPoint.location_id}
																	. This action cannot be undone.
																</>
															}
															deleteTitle="Delete reorder point?"
															editHref={`/inventory/reorder-points/${reorderPoint.id}/edit`}
															isDeletePending={isDeleting(reorderPoint.id)}
															onDelete={() => deleteRow(reorderPoint.id)}
														/>
													</TableCell>
												) : null}
											</TableRow>
										))
									) : (
										<TableEmptyState
											colSpan={canManage ? 5 : 4}
											description="Create a reorder point to start tracking low stock for a product and location."
											icon={AlertTriangleIcon}
											title="No reorder points found"
										/>
									)}
								</TableBody>
							</Table>
						</>
					)}
				</ResourceListQueryState>
			</ResourceListCard>
		</ResourcePage>
	);
}
