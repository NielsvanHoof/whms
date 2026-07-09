"use client";

import { useAuthContext } from "@/components/providers/auth-provider";

export function usePermissions() {
	const auth = useAuthContext();

	return {
		permissions: auth.permissions,
		me: auth.me,
		isLoading: auth.isLoading,
		can: auth.can,
		canAny: auth.canAny,
		canAll: auth.canAll,
	};
}
