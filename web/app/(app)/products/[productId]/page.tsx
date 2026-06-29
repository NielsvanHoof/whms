"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, PackageSearchIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { TableEmptyState } from "@/components/query/table-empty-state";
import { Badge } from "@/components/ui/badge";
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
import { usePermissions } from "@/hooks/use-permissions";
import {
	canManageProducts,
	canViewInventory,
	canViewProducts,
} from "@/lib/permissions";
import { inventoryBalancesListQueryOptions } from "@/lib/queries/inventory";
import { productDetailQueryOptions } from "@/lib/queries/products";
import { formatDate } from "@/lib/utils";

export default function ProductDetailPage() {
	const { permissions: permissionList } = usePermissions();
	const params = useParams();
	const rawId = params.productId;
	const productId =
		typeof rawId === "string" ? Number.parseInt(rawId, 10) : Number.NaN;
	const idIsValid = Number.isFinite(productId);

	const canView = canViewProducts(permissionList);
	const canEdit = canManageProducts(permissionList);
	const canViewStock = canViewInventory(permissionList);

	const detailQuery = useQuery({
		...productDetailQueryOptions(idIsValid ? productId : 0),
		enabled: idIsValid && canView,
	});

	const balancesQuery = useQuery({
		...inventoryBalancesListQueryOptions({
			"filter[product_id]": String(productId),
			per_page: 25,
			page: 1,
		}),
		enabled: idIsValid && canView && canViewStock,
	});

	if (!canView) {
		return (
			<div className="flex flex-col gap-6 p-6">
				<ErrorState
					description="You do not have permission to view products."
					title="Access denied"
				/>
			</div>
		);
	}

	if (!idIsValid) {
		return (
			<div className="flex flex-col gap-4 p-6">
				<ErrorState
					description="The product ID in the URL is not valid."
					title="Invalid product"
				/>
				<Button asChild variant="outline">
					<Link href="/products">Back to products</Link>
				</Button>
			</div>
		);
	}

	const product = detailQuery.data?.data;

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-wrap items-center gap-2">
				<Button asChild size="sm" variant="outline">
					<Link href="/products">
						<ArrowLeftIcon data-icon="inline-start" />
						Products
					</Link>
				</Button>
				{canEdit && product ? (
					<Button asChild size="sm">
						<Link href={`/products/${product.id}/edit`}>
							<PencilIcon data-icon="inline-start" />
							Edit
						</Link>
					</Button>
				) : null}
			</div>

			{detailQuery.isPending ? <LoadingState title="Loading product" /> : null}
			{detailQuery.isError ? (
				<ErrorState
					description="This product may not exist or you may not have access."
					error={detailQuery.error}
					title="Could not load product"
				/>
			) : null}

			{product ? (
				<>
					<Card>
						<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
							<div className="flex flex-col gap-1.5">
								<CardTitle>{product.name}</CardTitle>
								<CardDescription>SKU {product.sku}</CardDescription>
							</div>
							<Badge variant={product.is_active ? "default" : "secondary"}>
								{product.is_active ? "Active" : "Inactive"}
							</Badge>
						</CardHeader>
						<CardContent>
							<dl className="grid gap-4 sm:grid-cols-2">
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										ID
									</dt>
									<dd className="text-sm">{product.id}</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Unit
									</dt>
									<dd className="text-sm">{product.unit}</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Created
									</dt>
									<dd className="text-sm">{formatDate(product.created_at)}</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Updated
									</dt>
									<dd className="text-sm">{formatDate(product.updated_at)}</dd>
								</div>
							</dl>
						</CardContent>
					</Card>

					{canViewStock ? (
						<Card>
							<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
								<div className="flex flex-col gap-1.5">
									<CardTitle>Stock balances</CardTitle>
									<CardDescription>
										On-hand quantities for this product across locations.
									</CardDescription>
								</div>
								<Button asChild size="sm" variant="outline">
									<Link
										href={`/inventory/balances?filter[product_id]=${product.id}`}
									>
										View all balances
									</Link>
								</Button>
							</CardHeader>
							<CardContent>
								{balancesQuery.isPending ? (
									<LoadingState title="Loading balances" />
								) : null}
								{balancesQuery.isError ? (
									<ErrorState
										error={balancesQuery.error}
										title="Could not load balances"
									/>
								) : null}
								{balancesQuery.data ? (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Warehouse</TableHead>
												<TableHead>Location</TableHead>
												<TableHead className="text-right">Quantity</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{balancesQuery.data.data.length ? (
												balancesQuery.data.data.map((balance) => (
													<TableRow key={balance.id}>
														<TableCell>
															{balance.warehouse?.name ?? balance.warehouse_id}
														</TableCell>
														<TableCell className="font-medium">
															<Link
																className="hover:underline"
																href={`/inventory/balances/${balance.id}`}
															>
																{balance.location?.code ?? balance.location_id}
															</Link>
														</TableCell>
														<TableCell className="text-right tabular-nums">
															{balance.quantity}
														</TableCell>
													</TableRow>
												))
											) : (
												<TableEmptyState
													colSpan={3}
													description="No stock recorded for this product yet."
													icon={PackageSearchIcon}
													title="No balances"
												/>
											)}
										</TableBody>
									</Table>
								) : null}
							</CardContent>
						</Card>
					) : null}
				</>
			) : null}
		</div>
	);
}
