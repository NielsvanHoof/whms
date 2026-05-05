import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
	AUTH_SESSION_COOKIE_NAME,
	AUTH_SESSION_COOKIE_VALUE,
} from "@/lib/auth";

/**
 * Root router: use the proxy-visible cookie for the first decision.
 * The dashboard shell still validates localStorage on the client before showing content.
 */
export default async function Home() {
	const cookieStore = await cookies();
	const isAuthenticated =
		cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value ===
		AUTH_SESSION_COOKIE_VALUE;

	redirect(isAuthenticated ? "/dashboard" : "/login");
}
