"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { usePermissions } from "@/hooks/use-permissions";
import type { PermissionKey } from "@/lib/permissions";

type PermissionGuardProps = {
	children: React.ReactNode;
	allOf?: PermissionKey[];
	anyOf?: PermissionKey[];
	redirectTo?: string;
};

export function PermissionGuard({
	children,
	allOf = [],
	anyOf = [],
	redirectTo = "/dashboard",
}: PermissionGuardProps) {
	const router = useRouter();
	const { canAll, canAny, isLoading } = usePermissions();

	const isAuthorized =
		(allOf.length === 0 || canAll(allOf)) &&
		(anyOf.length === 0 || canAny(anyOf));

	useEffect(() => {
		if (!isLoading && !isAuthorized) {
			router.replace(redirectTo);
		}
	}, [isAuthorized, isLoading, redirectTo, router]);

	if (isLoading || !isAuthorized) {
		return (
			<div className="flex min-h-full flex-1 items-center justify-center">
				<Spinner className="size-8 text-muted-foreground" />
			</div>
		);
	}

	return <>{children}</>;
}
