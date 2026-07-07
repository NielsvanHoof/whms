"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldIcon } from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { SettingsNav } from "@/components/settings/settings-nav";
import { WorkspaceSettingsForm } from "@/components/settings/workspace-settings-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { usePermissions } from "@/hooks/use-permissions";
import { canManageTenant, canViewRoles } from "@/lib/permissions";
import { meQueryOptions } from "@/lib/queries/me";

export function WorkspaceSettingsPage() {
	const { permissions: permissionList } = usePermissions();
	const meQuery = useQuery(meQueryOptions());
	const canOpenAdmin = canViewRoles(permissionList);
	const canEditWorkspace = canManageTenant(permissionList);

	if (meQuery.isPending) {
		return (
			<div className="flex flex-col gap-8 p-6">
				<SettingsHeader />
				<LoadingState title="Loading workspace" />
			</div>
		);
	}

	if (meQuery.isError) {
		return (
			<div className="flex flex-col gap-8 p-6">
				<SettingsHeader />
				<ErrorState error={meQuery.error} title="Could not load workspace" />
			</div>
		);
	}

	const tenant = meQuery.data.data.tenant;

	return (
		<div className="flex flex-col gap-8 p-6">
			<SettingsHeader />

			{tenant && canEditWorkspace ? (
				<WorkspaceSettingsForm
					defaultName={tenant.name}
					defaultSlug={tenant.slug}
				/>
			) : (
				<Card className="max-w-2xl">
					<CardHeader>
						<CardTitle>General</CardTitle>
						<CardDescription>
							{canEditWorkspace
								? "Basic workspace identity."
								: "You need tenant admin permission to edit workspace settings."}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						{tenant ? (
							<dl className="grid gap-4 sm:grid-cols-2">
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Workspace name
									</dt>
									<dd className="text-sm">{tenant.name}</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Slug
									</dt>
									<dd className="font-mono text-sm">{tenant.slug}</dd>
								</div>
							</dl>
						) : (
							<p className="text-muted-foreground text-sm">
								No workspace is linked to your account.
							</p>
						)}
					</CardContent>
				</Card>
			)}

			<Card className="max-w-2xl opacity-80">
				<CardHeader>
					<CardTitle>Branding</CardTitle>
					<CardDescription>
						Logo and visual identity settings will be editable here once tenant
						admin APIs are available.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">Coming soon.</p>
				</CardContent>
			</Card>

			<Card className="max-w-2xl opacity-80">
				<CardHeader>
					<CardTitle>Policies</CardTitle>
					<CardDescription>
						Workspace defaults and policy toggles will be configurable here once
						tenant admin APIs are available.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">Coming soon.</p>
				</CardContent>
			</Card>

			{canOpenAdmin ? (
				<Button asChild className="w-fit" size="sm" variant="outline">
					<Link href="/admin">
						<ShieldIcon aria-hidden data-icon="inline-start" />
						Open Administration
					</Link>
				</Button>
			) : null}
		</div>
	);
}

function SettingsHeader() {
	return (
		<div className="flex max-w-2xl flex-col gap-4">
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
				<p className="text-muted-foreground text-sm">
					Workspace configuration for your tenant.
				</p>
			</div>
			<SettingsNav />
		</div>
	);
}
