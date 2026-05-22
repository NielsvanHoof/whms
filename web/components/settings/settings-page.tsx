"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldIcon } from "lucide-react";
import Link from "next/link";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { AccountProfileForm } from "@/components/settings/account-profile-form";
import { AccountSessionsCard } from "@/components/settings/account-sessions-card";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { SettingsNav } from "@/components/settings/settings-nav";
import { UserPreferencesForm } from "@/components/settings/user-preferences-form";
import { ModeToggle } from "@/components/theme/mode-toggle";
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
import { meQueryOptions } from "@/lib/queries/me";

function RoleList({ roles }: { roles: string[] }) {
	if (!roles.length) {
		return <p className="text-muted-foreground text-sm">No roles assigned.</p>;
	}

	return (
		<ul className="flex flex-wrap gap-2">
			{roles.map((role) => (
				<li
					key={role}
					className="rounded-md border border-border bg-muted/50 px-2.5 py-1 font-medium text-sm"
				>
					{role}
				</li>
			))}
		</ul>
	);
}

export function SettingsPage() {
	const { permissions: permissionList } = usePermissions();
	const meQuery = useQuery(meQueryOptions());
	const canOpenAdmin = canViewRoles(permissionList);

	if (meQuery.isPending) {
		return (
			<div className="p-6">
				<LoadingState title="Loading account" />
			</div>
		);
	}

	if (meQuery.isError) {
		return (
			<div className="p-6">
				<ErrorState error={meQuery.error} title="Could not load account" />
			</div>
		);
	}

	const me = meQuery.data.data;
	const { user, tenant, roles, permissions } = me;

	return (
		<div className="flex flex-col gap-8 p-6">
			<div className="flex max-w-2xl flex-col gap-4">
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
					<p className="text-muted-foreground text-sm">
						Manage your account, password, and preferences.
					</p>
				</div>
				<SettingsNav />
			</div>

			<Card className="max-w-2xl">
				<CardHeader>
					<CardTitle>Account</CardTitle>
					<CardDescription>
						Your tenant membership and access for this workspace.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-6">
					<dl className="grid gap-4 sm:grid-cols-2">
						<div className="flex flex-col gap-1">
							<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
								Email
							</dt>
							<dd className="text-sm">{user.email}</dd>
						</div>
						{tenant ? (
							<div className="flex flex-col gap-1">
								<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
									Workspace
								</dt>
								<dd className="text-sm">
									{tenant.name}
									<span className="text-muted-foreground">
										{" "}
										· {tenant.slug}
									</span>
								</dd>
							</div>
						) : null}
					</dl>

					<div className="flex flex-col gap-2">
						<h3 className="font-medium text-sm">Roles</h3>
						<RoleList roles={roles} />
					</div>

					<div className="flex flex-col gap-2">
						<h3 className="font-medium text-sm">
							Permissions
							<span className="font-normal text-muted-foreground">
								{" "}
								({permissions.length})
							</span>
						</h3>
						{permissions.length ? (
							<p className="text-muted-foreground text-sm leading-relaxed">
								{permissions.join(", ")}
							</p>
						) : (
							<p className="text-muted-foreground text-sm">
								No permissions assigned.
							</p>
						)}
					</div>

					{canOpenAdmin ? (
						<Button asChild className="w-fit" size="sm" variant="outline">
							<Link href="/admin">
								<ShieldIcon aria-hidden data-icon="inline-start" />
								Administration
							</Link>
						</Button>
					) : null}
				</CardContent>
			</Card>

			<AccountProfileForm defaultName={user.name} />

			<ChangePasswordForm />

			<UserPreferencesForm />

			<Card className="max-w-2xl">
				<CardHeader>
					<CardTitle>Appearance</CardTitle>
					<CardDescription>
						Choose how Warehouse looks on this device.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ModeToggle layout="group" />
				</CardContent>
			</Card>

			<AccountSessionsCard />
		</div>
	);
}
