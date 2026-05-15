"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

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
import { inventoryBalanceDetailQueryOptions } from "@/lib/queries/inventory";

export default function InventoryBalanceDetailPage() {
	const params = useParams();
	const rawId = params.balanceId;
	const balanceId =
		typeof rawId === "string" ? Number.parseInt(rawId, 10) : Number.NaN;
	const idIsValid = Number.isFinite(balanceId);

	const detailQuery = useQuery({
		...inventoryBalanceDetailQueryOptions(idIsValid ? balanceId : 0),
		enabled: idIsValid,
	});

	if (!idIsValid) {
		return (
			<div className="flex flex-col gap-4 p-6">
				<ErrorState
					description="The balance ID in the URL is not valid."
					title="Invalid balance"
				/>
				<Button asChild variant="outline">
					<Link href="/inventory/balances">Back to balances</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-wrap items-center gap-2">
				<Button asChild size="sm" variant="outline">
					<Link href="/inventory/balances">← Balances</Link>
				</Button>
				<Button asChild size="sm" variant="outline">
					<Link href="/inventory/movements">Movements</Link>
				</Button>
			</div>

			{detailQuery.isPending ? <LoadingState title="Loading balance" /> : null}
			{detailQuery.isError ? (
				<ErrorState
					description="This balance may not exist or you may not have access."
					error={detailQuery.error}
					title="Could not load balance"
				/>
			) : null}

			{detailQuery.data ? (
				<Card>
					<CardHeader>
						<CardTitle>Balance #{detailQuery.data.data.id}</CardTitle>
						<CardDescription>
							On-hand quantity for one warehouse, location, and product.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3 sm:grid-cols-2">
						<div>
							<p className="text-muted-foreground text-xs">Quantity</p>
							<p className="font-semibold text-2xl tabular-nums">
								{detailQuery.data.data.quantity}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Warehouse</p>
							<p className="font-medium">
								{detailQuery.data.data.warehouse?.name ??
									detailQuery.data.data.warehouse_id}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Location</p>
							<p className="font-medium">
								{detailQuery.data.data.location?.code ??
									detailQuery.data.data.location_id}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Product</p>
							<p className="font-medium">
								{detailQuery.data.data.product
									? `${detailQuery.data.data.product.sku} — ${detailQuery.data.data.product.name}`
									: detailQuery.data.data.product_id}
							</p>
						</div>
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
