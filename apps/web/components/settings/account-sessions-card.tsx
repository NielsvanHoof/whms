"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOutIcon, MonitorIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DeleteConfirmDialog } from "@/components/confirm/delete-confirm-dialog";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	revokeAccountSession,
	revokeAllAccountSessions,
} from "@/lib/api/account";
import { isCurrentAccountSession } from "@/lib/api/account-session";
import { signOut } from "@/lib/auth/sign-out";
import {
	accountSessionsQueryKeys,
	accountSessionsQueryOptions,
} from "@/lib/queries/account-sessions";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { formatDate } from "@/lib/utils";

export function AccountSessionsCard() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [revokingId, setRevokingId] = useState<number | null>(null);

	const sessionsQuery = useQuery(accountSessionsQueryOptions());

	const revokeOneMutation = useMutation({
		mutationFn: revokeAccountSession,
		onSuccess: async (_data, tokenId) => {
			await queryClient.invalidateQueries({
				queryKey: accountSessionsQueryKeys.all,
			});
			const sessions = sessionsQuery.data?.data ?? [];
			const revoked = sessions.find((session) => session.id === tokenId);
			if (revoked && isCurrentAccountSession(revoked.is_current)) {
				toastSuccess("This device was signed out");
				await signOut(router);
				return;
			}
			toastSuccess("Session revoked");
		},
		onError: (error) => {
			void toastApiError(error, "Could not revoke session.");
		},
	});

	const revokeAllMutation = useMutation({
		mutationFn: revokeAllAccountSessions,
		onSuccess: async () => {
			toastSuccess("All sessions revoked");
			await signOut(router);
		},
		onError: (error) => {
			void toastApiError(error, "Could not revoke sessions.");
		},
	});

	const revokeOthersMutation = useMutation({
		mutationFn: async (tokenIds: number[]) => {
			await Promise.all(tokenIds.map((id) => revokeAccountSession(id)));
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: accountSessionsQueryKeys.all,
			});
			toastSuccess("Other sessions revoked");
		},
		onError: (error) => {
			void toastApiError(error, "Could not revoke sessions.");
		},
	});

	async function handleRevokeOne(tokenId: number) {
		setRevokingId(tokenId);
		try {
			await revokeOneMutation.mutateAsync(tokenId);
		} finally {
			setRevokingId(null);
		}
	}

	const sessions = sessionsQuery.data?.data ?? [];
	const otherSessions = sessions.filter(
		(session) => !isCurrentAccountSession(session.is_current),
	);

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle>Active sessions</CardTitle>
				<CardDescription>
					Devices and browsers signed in with your account. Revoking a session
					ends its API token immediately.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{sessionsQuery.isPending ? (
					<LoadingState title="Loading sessions" />
				) : null}
				{sessionsQuery.isError ? (
					<ErrorState
						error={sessionsQuery.error}
						onRetry={() => {
							void sessionsQuery.refetch();
						}}
						title="Could not load sessions"
					/>
				) : null}
				{sessionsQuery.isSuccess && sessions.length === 0 ? (
					<Empty className="border px-4 py-8">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<MonitorIcon aria-hidden />
							</EmptyMedia>
							<EmptyTitle>No active sessions</EmptyTitle>
							<EmptyDescription>
								No API tokens are currently active for this account.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : null}
				{sessionsQuery.isSuccess && sessions.length > 0 ? (
					<div className="overflow-x-auto rounded-lg border border-border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Device</TableHead>
									<TableHead>Last used</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="w-[100px]" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{sessions.map((session) => {
									const isCurrent = isCurrentAccountSession(session.is_current);
									const isRevoking =
										revokingId === session.id && revokeOneMutation.isPending;

									return (
										<TableRow key={session.id}>
											<TableCell>
												<div className="flex flex-col gap-1">
													<span className="font-medium text-sm">
														{session.name || "Unknown device"}
													</span>
													{isCurrent ? (
														<Badge variant="secondary">This device</Badge>
													) : null}
												</div>
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{formatDate(session.last_used_at)}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{formatDate(session.created_at)}
											</TableCell>
											<TableCell className="text-right">
												<Button
													disabled={
														isRevoking ||
														revokeAllMutation.isPending ||
														revokeOthersMutation.isPending
													}
													onClick={() => {
														void handleRevokeOne(session.id);
													}}
													size="sm"
													type="button"
													variant="outline"
												>
													{isRevoking ? (
														<Spinner aria-hidden data-icon="inline-start" />
													) : null}
													{isRevoking ? "Revoking..." : "Revoke"}
												</Button>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				) : null}
			</CardContent>
			<CardFooter className="flex flex-wrap gap-2 border-t border-border/60 pt-6">
				<Button
					onClick={() => {
						void signOut(router);
					}}
					type="button"
					variant="outline"
				>
					<LogOutIcon aria-hidden data-icon="inline-start" />
					Sign out on this device
				</Button>
				{otherSessions.length > 0 ? (
					<DeleteConfirmDialog
						confirmLabel="Revoke others"
						description="All other devices will be signed out. This device stays signed in."
						isPending={revokeOthersMutation.isPending}
						onConfirm={() =>
							revokeOthersMutation.mutateAsync(
								otherSessions.map((session) => session.id),
							)
						}
						title="Revoke all other sessions?"
						trigger={
							<Button
								disabled={
									revokeOneMutation.isPending || revokeAllMutation.isPending
								}
								type="button"
								variant="outline"
							>
								Revoke all other sessions
							</Button>
						}
					/>
				) : null}
				{sessions.length > 1 ? (
					<DeleteConfirmDialog
						confirmLabel="Revoke all"
						description="Every signed-in device will be signed out, including this one."
						isPending={revokeAllMutation.isPending}
						onConfirm={() => revokeAllMutation.mutateAsync()}
						title="Revoke all sessions?"
						trigger={
							<Button
								disabled={
									revokeOneMutation.isPending || revokeOthersMutation.isPending
								}
								type="button"
								variant="destructive"
							>
								Revoke all sessions
							</Button>
						}
					/>
				) : null}
			</CardFooter>
		</Card>
	);
}
