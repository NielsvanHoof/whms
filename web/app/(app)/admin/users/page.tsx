"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import { useState } from "react";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
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
	const isError = usersQuery.isError || rolesQuery.isError;
	const canViewUsers = canViewRoles(permissionList);
	const canAssignRoles = canManageRoles(permissionList);

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl tracking-tight">User roles</h1>
				<p className="text-muted-foreground text-sm">
					Assign role memberships for tenant users.
				</p>
			</div>
			{!canViewUsers ? (
				<ErrorState
					description="You do not have permission to view user role assignments."
					title="Access denied"
				/>
			) : null}

			{canViewUsers ? (
				<Card>
					<CardHeader>
						<CardTitle>Role assignments</CardTitle>
					</CardHeader>
					<CardContent>
						{isPending ? (
							<LoadingState title="Loading users and roles" />
						) : null}
						{isError ? (
							<ErrorState
								error={usersQuery.error ?? rolesQuery.error}
								title="Could not load access users"
							/>
						) : null}
						{usersQuery.data && rolesQuery.data ? (
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
									{usersQuery.data.data.map((user) => {
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
																			return { ...previous, [user.id]: next };
																		});
																	}}
																	size="xs"
																	type="button"
																	variant={selected ? "secondary" : "outline"}
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
																<Spinner aria-hidden data-icon="inline-start" />
															) : (
																<SaveIcon data-icon="inline-start" />
															)}
															Save
														</Button>
													</div>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						) : null}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
