"use client";

import { ErrorState } from "@/components/query/error-state";
import { Spinner } from "@/components/ui/spinner";
import { usePermissions } from "@/hooks/use-permissions";
import type { PermissionKey } from "@/lib/permissions";

type PermissionGuardProps = {
	children: React.ReactNode;
	allOf?: PermissionKey[];
	anyOf?: PermissionKey[];
	accessDeniedDescription?: string;
};

export function PermissionGuard({
	children,
	allOf = [],
	anyOf = [],
	accessDeniedDescription = "You do not have permission to view this section.",
}: PermissionGuardProps) {
	const { canAll, canAny, isLoading } = usePermissions();

	const isAuthorized =
		(allOf.length === 0 || canAll(allOf)) &&
		(anyOf.length === 0 || canAny(anyOf));

	if (isLoading) {
		return (
			<div className="flex min-h-full flex-1 items-center justify-center">
				<Spinner className="size-8 text-muted-foreground" />
			</div>
		);
	}

	if (!isAuthorized) {
		return (
			<div className="flex flex-col gap-6 p-6">
				<ErrorState
					description={accessDeniedDescription}
					title="Access denied"
				/>
			</div>
		);
	}

	return <>{children}</>;
}
