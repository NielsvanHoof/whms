"use client";

import { useQuery } from "@tanstack/react-query";

import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { usePermissions } from "@/hooks/use-permissions";
import { normalizeNameList } from "@/lib/access";
import { canViewRoles } from "@/lib/permissions";
import { accessRolesQueryOptions } from "@/lib/queries/access";

export default function AdminRolesPage() {
	const { permissions: permissionList } = usePermissions();
	const rolesQuery = useQuery(accessRolesQueryOptions());
	const canView = canViewRoles(permissionList);

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl tracking-tight">Roles</h1>
				<p className="text-muted-foreground text-sm">
					Role catalog with attached permissions.
				</p>
			</div>
			{!canView ? (
				<ErrorState
					description="You do not have permission to view roles."
					title="Access denied"
				/>
			) : null}

			{canView ? (
				<Card>
					<CardHeader>
						<CardTitle>Role definitions</CardTitle>
					</CardHeader>
					<CardContent>
						{rolesQuery.isPending ? (
							<LoadingState title="Loading roles" />
						) : null}
						{rolesQuery.isError ? (
							<ErrorState
								error={rolesQuery.error}
								title="Could not load roles"
							/>
						) : null}
						{rolesQuery.data ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Role</TableHead>
										<TableHead>Permissions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{rolesQuery.data.data.map((role) => (
										<TableRow key={role.id}>
											<TableCell className="font-medium">{role.name}</TableCell>
											<TableCell>
												{normalizeNameList(role.permissions).join(", ") || "-"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : null}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
