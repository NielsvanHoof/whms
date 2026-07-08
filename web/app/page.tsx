import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * Root router: use the proxy-visible Laravel session cookie for the first decision.
 * The dashboard shell still validates the session with `/me` before showing content.
 */
export default async function Home() {
	const cookieStore = await cookies();
	const isAuthenticated = Boolean(cookieStore.get(AUTH_SESSION_COOKIE_NAME));

	redirect(isAuthenticated ? "/dashboard" : "/login");
}
