"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { ProductForm } from "@/components/products/product-form";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/lib/permissions";
import { productDetailQueryOptions } from "@/lib/queries/products";

export default function EditProductPage({
	params,
}: {
	params: { productId: string };
}) {
	const productId = Number.parseInt(params.productId, 10);
	const query = useQuery(productDetailQueryOptions(productId));

	return (
		<PermissionGuard allOf={[PERMISSIONS.productsManage]}>
			<div className="flex flex-col gap-6 p-6">
				<div className="flex items-center justify-between gap-3">
					<div className="flex flex-col gap-2">
						<h1 className="font-semibold text-2xl tracking-tight">
							Edit product
						</h1>
						<p className="text-muted-foreground text-sm">
							Update product details.
						</p>
					</div>
					<Button asChild variant="outline">
						<Link href="/products">
							<ArrowLeftIcon data-icon="inline-start" />
							Back to list
						</Link>
					</Button>
				</div>
				{query.isPending ? <LoadingState title="Loading product" /> : null}
				{query.isError ? (
					<ErrorState error={query.error} title="Could not load product" />
				) : null}
				{query.data ? (
					<ProductForm
						defaultValues={{
							sku: query.data.data.sku,
							name: query.data.data.name,
							unit: query.data.data.unit,
							isActive: query.data.data.is_active,
						}}
						mode="edit"
						productId={productId}
					/>
				) : null}
			</div>
		</PermissionGuard>
	);
}
