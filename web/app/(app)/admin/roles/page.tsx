"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { RefreshingIndicator } from "@/components/query/refreshing-indicator";
import { TableEmptyState } from "@/components/query/table-empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDelayedPending } from "@/hooks/use-delayed-pending";
import { usePermissions } from "@/hooks/use-permissions";
import { normalizeNameList } from "@/lib/access";
import { canViewRoles } from "@/lib/permissions";
import { accessRolesQueryOptions } from "@/lib/queries/access";

export default function AdminRolesPage() {
	const { permissions: permissionList } = usePermissions();
	const rolesQuery = useQuery(accessRolesQueryOptions());
	const canView = canViewRoles(permissionList);
	const showPending = useDelayedPending(rolesQuery.isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<PageHeader
				description="Role catalog with attached permissions."
				title="Roles"
			/>
			{!canView ? (
				<ErrorState
					description="You do not have permission to view roles."
					title="Access denied"
				/>
			) : null}

			{canView ? (
				<Card>
					<CardContent className="pt-6">
						{showPending && !rolesQuery.data ? (
							<LoadingState title="Loading roles" />
						) : null}
						{rolesQuery.isError ? (
							<ErrorState
								error={rolesQuery.error}
								isRetrying={rolesQuery.isFetching && !showPending}
								onRetry={() => {
									void rolesQuery.refetch();
								}}
								title="Could not load roles"
							/>
						) : null}
						{rolesQuery.data ? (
							<div className="relative flex flex-col gap-3">
								{rolesQuery.isFetching && !showPending ? (
									<RefreshingIndicator />
								) : null}
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Role</TableHead>
											<TableHead>Permissions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{rolesQuery.data.data.length ? (
											rolesQuery.data.data.map((role) => (
												<TableRow key={role.id}>
													<TableCell className="font-medium">
														{role.name}
													</TableCell>
													<TableCell>
														{normalizeNameList(role.permissions).join(", ") ||
															"-"}
													</TableCell>
												</TableRow>
											))
										) : (
											<TableEmptyState
												colSpan={2}
												description="No roles have been defined for this tenant."
												icon={ShieldIcon}
												title="No roles found"
											/>
										)}
									</TableBody>
								</Table>
							</div>
						) : null}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
