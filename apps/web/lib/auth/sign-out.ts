import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { logoutApi } from "@/lib/api/account";
import { notifyAuthSessionCleared } from "@/lib/auth/auth-session";

/**
 * Ends the Laravel session cookie when possible, then signals the client to refetch /me.
 */
export async function signOut(router?: AppRouterInstance): Promise<void> {
	try {
		await logoutApi();
	} catch {
		// Still clear local auth view if the API is unreachable or session already invalid.
	}

	notifyAuthSessionCleared();

	if (router) {
		router.replace("/login");
		router.refresh();
	}
}
