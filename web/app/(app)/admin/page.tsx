"use client";

import { ShieldCheckIcon, UserCogIcon } from "lucide-react";
import Link from "next/link";
import { ErrorState } from "@/components/query/error-state";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { usePermissions } from "@/hooks/use-permissions";
import { canViewRoles } from "@/lib/permissions";

export default function AdminPage() {
	const { permissions: permissionList } = usePermissions();
	const canSeeAdminSections = canViewRoles(permissionList);

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl tracking-tight">
					Administration
				</h1>
				<p className="text-muted-foreground text-sm">
					Manage user roles and review tenant permissions.
				</p>
			</div>
			{!canSeeAdminSections ? (
				<ErrorState
					description="You do not have permission to view administration sections."
					title="Access denied"
				/>
			) : null}

			{canSeeAdminSections ? (
				<div className="grid gap-4 md:grid-cols-2">
					<Card>
						<CardHeader className="flex flex-row items-start justify-between gap-3">
							<div className="flex flex-col gap-1">
								<CardTitle>User role assignments</CardTitle>
								<CardDescription>
									Grant or remove roles for each tenant user.
								</CardDescription>
							</div>
							<UserCogIcon
								aria-hidden
								className="size-5 text-muted-foreground"
							/>
						</CardHeader>
						<CardContent>
							<Button asChild size="sm" variant="outline">
								<Link href="/admin/users">Manage users</Link>
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-start justify-between gap-3">
							<div className="flex flex-col gap-1">
								<CardTitle>Permissions catalog</CardTitle>
								<CardDescription>
									Inspect roles and effective permissions available in the
									system.
								</CardDescription>
							</div>
							<ShieldCheckIcon
								aria-hidden
								className="size-5 text-muted-foreground"
							/>
						</CardHeader>
						<CardContent className="flex gap-2">
							<Button asChild size="sm" variant="outline">
								<Link href="/admin/roles">Roles</Link>
							</Button>
							<Button asChild size="sm" variant="outline">
								<Link href="/admin/permissions">Permissions</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			) : null}
		</div>
	);
}
