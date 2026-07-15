import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { ProductForm } from "@/components/products/product-form";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/lib/permissions";

export default function CreateProductPage() {
	return (
		<PermissionGuard allOf={[PERMISSIONS.productsManage]}>
			<div className="flex flex-col gap-6 p-6">
				<div className="flex items-center justify-between gap-3">
					<div className="flex flex-col gap-2">
						<h1 className="font-semibold text-2xl tracking-tight">
							Create product
						</h1>
						<p className="text-muted-foreground text-sm">
							Add a new product record.
						</p>
					</div>
					<Button asChild variant="outline">
						<Link href="/products">
							<ArrowLeftIcon data-icon="inline-start" />
							Back to list
						</Link>
					</Button>
				</div>
				<ProductForm mode="create" />
			</div>
		</PermissionGuard>
	);
}
