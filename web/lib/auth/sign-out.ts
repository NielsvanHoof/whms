import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { logoutApi } from "@/lib/api/account";
import { logout as clearLocalAuthSession } from "@/lib/auth/auth-session";

/**
 * Revokes the current Sanctum token when possible, then clears local session.
 */
export async function signOut(router?: AppRouterInstance): Promise<void> {
	try {
		await logoutApi();
	} catch {
		// Still clear local session if the API is unreachable or token already invalid.
	}

	clearLocalAuthSession();

	if (router) {
		router.replace("/login");
		router.refresh();
	}
}
