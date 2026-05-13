import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { LocationForm } from "@/components/locations/location-form";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/lib/permissions";

export default function CreateLocationPage() {
	return (
		<PermissionGuard allOf={[PERMISSIONS.locationsManage]}>
			<div className="flex flex-col gap-6 p-6">
				<div className="flex items-center justify-between gap-3">
					<div className="flex flex-col gap-2">
						<h1 className="font-semibold text-2xl tracking-tight">
							Create location
						</h1>
						<p className="text-muted-foreground text-sm">
							Add a new storage location.
						</p>
					</div>
					<Button asChild variant="outline">
						<Link href="/locations">
							<ArrowLeftIcon data-icon="inline-start" />
							Back to list
						</Link>
					</Button>
				</div>
				<LocationForm mode="create" />
			</div>
		</PermissionGuard>
	);
}
