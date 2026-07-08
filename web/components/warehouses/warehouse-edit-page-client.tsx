"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { Button } from "@/components/ui/button";
import { WarehouseForm } from "@/components/warehouses/warehouse-form";
import { PERMISSIONS } from "@/lib/permissions";
import { warehouseDetailQueryOptions } from "@/lib/queries/warehouses";

type WarehouseEditPageClientProps = {
	warehouseId: number | null;
};

export function WarehouseEditPageClient({
	warehouseId,
}: WarehouseEditPageClientProps) {
	const idIsValid = warehouseId !== null;
	const query = useQuery({
		...warehouseDetailQueryOptions(warehouseId ?? 0),
		enabled: idIsValid,
	});

	return (
		<PermissionGuard allOf={[PERMISSIONS.warehousesManage]}>
			<div className="flex flex-col gap-6 p-6">
				<div className="flex items-center justify-between gap-3">
					<div className="flex flex-col gap-2">
						<h1 className="font-semibold text-2xl tracking-tight">
							Edit warehouse
						</h1>
						<p className="text-muted-foreground text-sm">
							Update warehouse details.
						</p>
					</div>
					<Button asChild variant="outline">
						<Link
							href={idIsValid ? `/warehouses/${warehouseId}` : "/warehouses"}
						>
							<ArrowLeftIcon data-icon="inline-start" />
							Back to warehouse
						</Link>
					</Button>
				</div>
				{!idIsValid ? (
					<ErrorState
						description="The warehouse ID in the URL is not valid."
						title="Invalid warehouse"
					/>
				) : null}
				{idIsValid && query.isPending ? (
					<LoadingState title="Loading warehouse" />
				) : null}
				{idIsValid && query.isError ? (
					<ErrorState error={query.error} title="Could not load warehouse" />
				) : null}
				{query.data && warehouseId !== null ? (
					<WarehouseForm
						defaultValues={{
							name: query.data.data.name,
							code: query.data.data.code ?? "",
						}}
						mode="edit"
						warehouseId={warehouseId}
					/>
				) : null}
			</div>
		</PermissionGuard>
	);
}
