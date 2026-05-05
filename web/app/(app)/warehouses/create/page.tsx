import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateWarehouseForm } from "@/components/warehouses/create-warehouse-form";

export default function CreateWarehousePage() {
	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex items-center justify-between gap-3">
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-2xl tracking-tight">
						Create warehouse
					</h1>
					<p className="text-muted-foreground text-sm">
						Create a new warehouse entry for this tenant.
					</p>
				</div>
				<Button asChild variant="outline">
					<Link href="/warehouses">
						<ArrowLeftIcon data-icon="inline-start" />
						Back to list
					</Link>
				</Button>
			</div>
			<CreateWarehouseForm />
		</div>
	);
}
