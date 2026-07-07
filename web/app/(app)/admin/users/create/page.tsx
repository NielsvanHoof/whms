import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { UserCreateForm } from "@/components/admin/user-create-form";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/lib/permissions";

export default function CreateAdminUserPage() {
	return (
		<PermissionGuard allOf={[PERMISSIONS.rolesManage]}>
			<div className="flex flex-col gap-6 p-6">
				<div className="flex items-center justify-between gap-3">
					<div className="flex flex-col gap-2">
						<h1 className="font-semibold text-2xl tracking-tight">
							Create user
						</h1>
						<p className="text-muted-foreground text-sm">
							Add a teammate to this workspace.
						</p>
					</div>
					<Button asChild variant="outline">
						<Link href="/admin/users">
							<ArrowLeftIcon data-icon="inline-start" />
							Back to users
						</Link>
					</Button>
				</div>
				<UserCreateForm />
			</div>
		</PermissionGuard>
	);
}
