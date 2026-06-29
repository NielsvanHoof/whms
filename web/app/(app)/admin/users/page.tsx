"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SaveIcon, UsersIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { FilterControl } from "@/components/filters/filter-control";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { RefreshingIndicator } from "@/components/query/refreshing-indicator";
import { TableEmptyState } from "@/components/query/table-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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
import { syncUserRoles } from "@/lib/api/access";
import { canManageRoles, canViewRoles } from "@/lib/permissions";
import {
	accessQueryKeys,
	accessRolesQueryOptions,
	accessUsersQueryOptions,
} from "@/lib/queries/access";
import { meQueryKeys } from "@/lib/queries/me";
import { toastApiError, toastSuccess } from "@/lib/toast";

function keyForRoleSet(roleNames: string[]): string {
	return [...roleNames].sort().join("|");
}

export default function AdminUsersPage() {
	const queryClient = useQueryClient();
	const { permissions: permissionList } = usePermissions();
	const usersQuery = useQuery(accessUsersQueryOptions());
	const rolesQuery = useQuery(accessRolesQueryOptions());
	const [editedRoles, setEditedRoles] = useState<Record<number, string[]>>({});
	const [search, setSearch] = useState("");

	const syncMutation = useMutation({
		mutationFn: ({ userId, roles }: { userId: number; roles: string[] }) =>
			syncUserRoles(userId, { roles }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: accessQueryKeys.users(),
			});
			await queryClient.invalidateQueries({
				queryKey: meQueryKeys.all,
			});
			toastSuccess("User roles updated");
		},
		onError: (error) => {
			void toastApiError(error, "Could not update user roles.");
		},
	});

	const isPending = usersQuery.isPending || rolesQuery.isPending;
	const showPending = useDelayedPending(isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});
	const isError = usersQuery.isError || rolesQuery.isError;
	const isFetching = usersQuery.isFetching || rolesQuery.isFetching;
	const canViewUsers = canViewRoles(permissionList);
	const canAssignRoles = canManageRoles(permissionList);

	const filteredUsers = useMemo(() => {
		const users = usersQuery.data?.data ?? [];
		const query = search.trim().toLowerCase();
		if (!query) {
			return users;
		}
		return users.filter(
			(user) =>
				user.name.toLowerCase().includes(query) ||
				user.email.toLowerCase().includes(query),
		);
	}, [search, usersQuery.data?.data]);

	return (
		<div className="flex flex-col gap-6 p-6">
			<PageHeader
				description="Assign role memberships for tenant users."
				title="User roles"
			/>
			{!canViewUsers ? (
				<ErrorState
					description="You do not have permission to view user role assignments."
					title="Access denied"
				/>
			) : null}

			{canViewUsers ? (
				<Card>
					<div className="border-b border-border/60 bg-muted/25 px-4 py-4">
						<FilterControl label="Search">
							<Input
								className="max-w-md"
								onChange={(event) => {
									setSearch(event.target.value);
								}}
								placeholder="Filter by name or email"
								value={search}
							/>
						</FilterControl>
					</div>
					<CardContent className="pt-6">
						{showPending && !usersQuery.data ? (
							<LoadingState title="Loading users and roles" />
						) : null}
						{isError ? (
							<ErrorState
								error={usersQuery.error ?? rolesQuery.error}
								isRetrying={isFetching && !showPending}
								onRetry={() => {
									void usersQuery.refetch();
									void rolesQuery.refetch();
								}}
								title="Could not load access users"
							/>
						) : null}
						{usersQuery.data && rolesQuery.data ? (
							<div className="relative flex flex-col gap-3">
								{isFetching && !showPending ? <RefreshingIndicator /> : null}
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>User</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Roles</TableHead>
											<TableHead className="text-right">Action</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredUsers.length ? (
											filteredUsers.map((user) => {
												const assignedRoles = normalizeNameList(user.roles);
												const draft = editedRoles[user.id] ?? assignedRoles;
												const hasChanges =
													keyForRoleSet(draft) !== keyForRoleSet(assignedRoles);
												const isSaving =
													syncMutation.isPending &&
													syncMutation.variables?.userId === user.id;

												return (
													<TableRow key={user.id}>
														<TableCell className="font-medium">
															{user.name}
														</TableCell>
														<TableCell>{user.email}</TableCell>
														<TableCell>
															<div className="flex flex-wrap gap-2">
																{rolesQuery.data.data.map((role) => {
																	const selected = draft.includes(role.name);
																	return (
																		<Button
																			key={role.id}
																			disabled={!canAssignRoles}
																			onClick={() => {
																				setEditedRoles((previous) => {
																					const current =
																						previous[user.id] ?? assignedRoles;
																					const next = selected
																						? current.filter(
																								(roleName) =>
																									roleName !== role.name,
																							)
																						: [...current, role.name];
																					return {
																						...previous,
																						[user.id]: next,
																					};
																				});
																			}}
																			size="xs"
																			type="button"
																			variant={
																				selected ? "secondary" : "outline"
																			}
																		>
																			{role.name}
																		</Button>
																	);
																})}
															</div>
														</TableCell>
														<TableCell className="text-right">
															<div className="flex justify-end gap-2">
																<Button
																	onClick={async () => {
																		await syncMutation.mutateAsync({
																			userId: user.id,
																			roles: draft,
																		});
																	}}
																	size="sm"
																	type="button"
																	variant="outline"
																	disabled={
																		!canAssignRoles || !hasChanges || isSaving
																	}
																>
																	{isSaving ? (
																		<Spinner
																			aria-hidden
																			data-icon="inline-start"
																		/>
																	) : (
																		<SaveIcon data-icon="inline-start" />
																	)}
																	Save
																</Button>
															</div>
														</TableCell>
													</TableRow>
												);
											})
										) : (
											<TableEmptyState
												colSpan={4}
												description={
													search
														? "Try a different search term."
														: "No users are available for role assignment."
												}
												icon={UsersIcon}
												title="No users found"
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
