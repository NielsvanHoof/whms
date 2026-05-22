"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	balancesForStockUrl,
	movementDetailUrl,
	transferMovementsListUrl,
} from "@/lib/inventory/movement-urls";
import type { components } from "@/lib/openapi/schema";
import {
	inventoryMovementDetailQueryOptions,
	transferMovementsQueryOptions,
} from "@/lib/queries/inventory";
import { formatDateTime } from "@/lib/utils/format-date";

type InventoryMovement = components["schemas"]["InventoryMovementResource"];

type MovementDetailContentProps = {
	movementId: number;
};

function kindLabel(kind: string): string {
	if (kind === "receipt") return "Receipt";
	if (kind === "adjustment") return "Adjustment";
	if (kind === "transfer") return "Transfer";
	return kind;
}

function MovementLinks({ movement }: { movement: InventoryMovement }) {
	return (
		<div className="flex flex-wrap gap-2">
			<Button asChild size="sm" variant="outline">
				<Link
					href={balancesForStockUrl({
						warehouseId: movement.warehouse_id,
						locationId: movement.location_id,
						productId: movement.product_id,
					})}
				>
					View balance
				</Link>
			</Button>
			{movement.location ? (
				<Button asChild size="sm" variant="outline">
					<Link href={`/locations/${movement.location_id}/edit`}>
						Location {movement.location.code}
					</Link>
				</Button>
			) : null}
			{movement.product ? (
				<Button asChild size="sm" variant="outline">
					<Link href={`/products/${movement.product_id}/edit`}>
						{movement.product.sku}
					</Link>
				</Button>
			) : null}
			{movement.warehouse ? (
				<Button asChild size="sm" variant="outline">
					<Link href={`/warehouses/${movement.warehouse_id}/edit`}>
						{movement.warehouse.name}
					</Link>
				</Button>
			) : null}
		</div>
	);
}

function RelatedTransferTable({
	rows,
	currentId,
}: {
	rows: InventoryMovement[];
	currentId: number;
}) {
	return (
		<div className="overflow-x-auto rounded-lg border border-border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>Location</TableHead>
						<TableHead>Product</TableHead>
						<TableHead className="text-right">Δ Qty</TableHead>
						<TableHead>When</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row) => (
						<TableRow
							key={row.id}
							className={row.id === currentId ? "bg-muted/50" : undefined}
						>
							<TableCell>
								{row.id === currentId ? (
									<span className="font-medium">{row.id}</span>
								) : (
									<Link
										className="text-primary underline-offset-4 hover:underline"
										href={movementDetailUrl(row.id)}
									>
										{row.id}
									</Link>
								)}
							</TableCell>
							<TableCell>{row.location?.code ?? row.location_id}</TableCell>
							<TableCell>
								{row.product
									? `${row.product.sku} — ${row.product.name}`
									: row.product_id}
							</TableCell>
							<TableCell className="text-right font-medium tabular-nums">
								{row.quantity_delta}
							</TableCell>
							<TableCell className="text-muted-foreground text-xs whitespace-nowrap">
								{formatDateTime(row.created_at)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export function MovementDetailContent({
	movementId,
}: MovementDetailContentProps) {
	const detailQuery = useQuery(inventoryMovementDetailQueryOptions(movementId));
	const movement = detailQuery.data?.data;
	const correlationId = movement?.transfer_correlation_id ?? "";

	const transferQuery = useQuery({
		...transferMovementsQueryOptions(correlationId),
		enabled: Boolean(correlationId),
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-wrap items-center gap-2">
				<Button asChild size="sm" variant="outline">
					<Link href="/inventory/movements">
						<ArrowLeftIcon aria-hidden data-icon="inline-start" />
						Movements
					</Link>
				</Button>
				{correlationId ? (
					<Button asChild size="sm" variant="outline">
						<Link href={transferMovementsListUrl(correlationId)}>
							View full transfer
						</Link>
					</Button>
				) : null}
			</div>

			{detailQuery.isPending ? <LoadingState title="Loading movement" /> : null}
			{detailQuery.isError ? (
				<ErrorState
					description="This movement may not exist or you may not have access."
					error={detailQuery.error}
					title="Could not load movement"
				/>
			) : null}

			{movement ? (
				<>
					<Card>
						<CardHeader>
							<CardTitle>Movement #{movement.id}</CardTitle>
							<CardDescription>
								{kindLabel(movement.kind)} ·{" "}
								{formatDateTime(movement.created_at)}
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-6">
							<dl className="grid gap-4 sm:grid-cols-2">
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Kind
									</dt>
									<dd className="text-sm">{kindLabel(movement.kind)}</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Quantity change
									</dt>
									<dd className="font-semibold text-lg tabular-nums">
										{movement.quantity_delta > 0 ? "+" : ""}
										{movement.quantity_delta}
									</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Warehouse
									</dt>
									<dd className="text-sm">
										{movement.warehouse?.name ?? movement.warehouse_id}
									</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Location
									</dt>
									<dd className="text-sm">
										{movement.location?.code ?? movement.location_id}
									</dd>
								</div>
								<div className="flex flex-col gap-1 sm:col-span-2">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Product
									</dt>
									<dd className="text-sm">
										{movement.product
											? `${movement.product.sku} — ${movement.product.name}`
											: movement.product_id}
									</dd>
								</div>
								{correlationId ? (
									<div className="flex flex-col gap-1 sm:col-span-2">
										<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
											Transfer reference
										</dt>
										<dd className="font-mono text-sm">{correlationId}</dd>
									</div>
								) : null}
							</dl>
							<MovementLinks movement={movement} />
						</CardContent>
					</Card>

					{correlationId ? (
						<Card>
							<CardHeader>
								<CardTitle>Related transfer lines</CardTitle>
								<CardDescription>
									All ledger rows sharing this transfer correlation id.
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-4">
								{transferQuery.isPending ? (
									<LoadingState title="Loading transfer lines" />
								) : null}
								{transferQuery.isError ? (
									<ErrorState
										error={transferQuery.error}
										title="Could not load related lines"
									/>
								) : null}
								{transferQuery.data?.data.length ? (
									<RelatedTransferTable
										currentId={movement.id}
										rows={transferQuery.data.data}
									/>
								) : (
									<p className="text-muted-foreground text-sm">
										No related lines found.
									</p>
								)}
							</CardContent>
						</Card>
					) : null}
				</>
			) : null}
		</div>
	);
}
