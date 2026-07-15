"use client";

import { useQuery } from "@tanstack/react-query";
import { KeyRoundIcon } from "lucide-react";

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
import { canViewRoles } from "@/lib/permissions";
import { accessPermissionsQueryOptions } from "@/lib/queries/access";

export default function AdminPermissionsPage() {
	const { permissions: permissionList } = usePermissions();
	const permissionsQuery = useQuery(accessPermissionsQueryOptions());
	const canView = canViewRoles(permissionList);
	const showPending = useDelayedPending(permissionsQuery.isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<PageHeader
				description="Permissions available for role assignment."
				title="Permissions"
			/>
			{!canView ? (
				<ErrorState
					description="You do not have permission to view permissions."
					title="Access denied"
				/>
			) : null}

			{canView ? (
				<Card>
					<CardContent className="pt-6">
						{showPending && !permissionsQuery.data ? (
							<LoadingState title="Loading permissions" />
						) : null}
						{permissionsQuery.isError ? (
							<ErrorState
								error={permissionsQuery.error}
								isRetrying={permissionsQuery.isFetching && !showPending}
								onRetry={() => {
									void permissionsQuery.refetch();
								}}
								title="Could not load permissions"
							/>
						) : null}
						{permissionsQuery.data ? (
							<div className="relative flex flex-col gap-3">
								{permissionsQuery.isFetching && !showPending ? (
									<RefreshingIndicator />
								) : null}
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>ID</TableHead>
											<TableHead>Name</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{permissionsQuery.data.data.length ? (
											permissionsQuery.data.data.map((permission) => (
												<TableRow key={permission.id}>
													<TableCell>{permission.id}</TableCell>
													<TableCell className="font-medium">
														{permission.name}
													</TableCell>
												</TableRow>
											))
										) : (
											<TableEmptyState
												colSpan={2}
												description="No permissions are registered for this application."
												icon={KeyRoundIcon}
												title="No permissions found"
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
