import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { ReorderPointForm } from "@/components/reorder-points/reorder-point-form";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/lib/permissions";

export default function CreateReorderPointPage() {
	return (
		<PermissionGuard allOf={[PERMISSIONS.inventoryManage]}>
			<div className="flex flex-col gap-6 p-6">
				<div className="flex items-center justify-between gap-3">
					<div className="flex flex-col gap-2">
						<h1 className="font-semibold text-2xl tracking-tight">
							Create reorder point
						</h1>
						<p className="text-muted-foreground text-sm">
							Set a low-stock threshold for a product at a location.
						</p>
					</div>
					<Button asChild variant="outline">
						<Link href="/inventory/reorder-points">
							<ArrowLeftIcon data-icon="inline-start" />
							Back to list
						</Link>
					</Button>
				</div>
				<ReorderPointForm mode="create" />
			</div>
		</PermissionGuard>
	);
}
