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
import { canViewRoles } from "@/lib/permissions";
import { accessPermissionsQueryOptions } from "@/lib/queries/access";

export default function AdminPermissionsPage() {
	const { permissions: permissionList } = usePermissions();
	const permissionsQuery = useQuery(accessPermissionsQueryOptions());
	const canView = canViewRoles(permissionList);

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl tracking-tight">Permissions</h1>
				<p className="text-muted-foreground text-sm">
					Permissions available for role assignment.
				</p>
			</div>
			{!canView ? (
				<ErrorState
					description="You do not have permission to view permissions."
					title="Access denied"
				/>
			) : null}

			{canView ? (
				<Card>
					<CardHeader>
						<CardTitle>Permission catalog</CardTitle>
					</CardHeader>
					<CardContent>
						{permissionsQuery.isPending ? (
							<LoadingState title="Loading permissions" />
						) : null}
						{permissionsQuery.isError ? (
							<ErrorState
								error={permissionsQuery.error}
								title="Could not load permissions"
							/>
						) : null}
						{permissionsQuery.data ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Name</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{permissionsQuery.data.data.map((permission) => (
										<TableRow key={permission.id}>
											<TableCell>{permission.id}</TableCell>
											<TableCell className="font-medium">
												{permission.name}
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
