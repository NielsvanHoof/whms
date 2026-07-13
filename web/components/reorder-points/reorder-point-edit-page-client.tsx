"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { ReorderPointForm } from "@/components/reorder-points/reorder-point-form";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/lib/permissions";
import { reorderPointDetailQueryOptions } from "@/lib/queries/reorder-points";

type ReorderPointEditPageClientProps = {
	reorderPointId: number | null;
};

export function ReorderPointEditPageClient({
	reorderPointId,
}: ReorderPointEditPageClientProps) {
	const idIsValid = reorderPointId !== null;
	const query = useQuery({
		...reorderPointDetailQueryOptions(reorderPointId ?? 0),
		enabled: idIsValid,
	});

	return (
		<PermissionGuard allOf={[PERMISSIONS.inventoryManage]}>
			<div className="flex flex-col gap-6 p-6">
				<div className="flex items-center justify-between gap-3">
					<div className="flex flex-col gap-2">
						<h1 className="font-semibold text-2xl tracking-tight">
							Edit reorder point
						</h1>
						<p className="text-muted-foreground text-sm">
							Update the low-stock threshold.
						</p>
					</div>
					<Button asChild variant="outline">
						<Link href="/inventory/reorder-points">
							<ArrowLeftIcon data-icon="inline-start" />
							Back to list
						</Link>
					</Button>
				</div>
				{!idIsValid ? (
					<ErrorState
						description="The reorder point ID in the URL is not valid."
						title="Invalid reorder point"
					/>
				) : null}
				{idIsValid && query.isPending ? (
					<LoadingState title="Loading reorder point" />
				) : null}
				{idIsValid && query.isError ? (
					<ErrorState
						error={query.error}
						title="Could not load reorder point"
					/>
				) : null}
				{query.data && reorderPointId !== null ? (
					<ReorderPointForm
						defaultValues={{
							productId: query.data.data.product_id,
							locationId: query.data.data.location_id,
							quantity: query.data.data.quantity,
						}}
						locationLabel={query.data.data.location?.code}
						mode="edit"
						productLabel={
							query.data.data.product
								? `${query.data.data.product.sku} — ${query.data.data.product.name}`
								: undefined
						}
						reorderPointId={reorderPointId}
					/>
				) : null}
			</div>
		</PermissionGuard>
	);
}
