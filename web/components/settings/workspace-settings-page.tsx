"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldIcon } from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { SettingsNav } from "@/components/settings/settings-nav";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePermissions } from "@/hooks/use-permissions";
import { canViewRoles } from "@/lib/permissions";
import { meQueryOptions } from "@/lib/queries/me";

export function WorkspaceSettingsPage() {
	const { permissions: permissionList } = usePermissions();
	const meQuery = useQuery(meQueryOptions());
	const canOpenAdmin = canViewRoles(permissionList);

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

			<Card className="max-w-2xl">
				<CardHeader>
					<CardTitle>General</CardTitle>
					<CardDescription>
						Basic workspace identity. Editing requires tenant admin APIs that
						are not available yet.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{tenant ? (
						<>
							<div className="flex flex-col gap-2">
								<Label htmlFor="workspace-name">Workspace name</Label>
								<Input
									disabled
									id="workspace-name"
									readOnly
									value={tenant.name}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="workspace-slug">Slug</Label>
								<Input
									className="font-mono"
									disabled
									id="workspace-slug"
									readOnly
									value={tenant.slug}
								/>
							</div>
						</>
					) : (
						<p className="text-muted-foreground text-sm">
							No workspace is linked to your account.
						</p>
					)}
				</CardContent>
			</Card>

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
