import type { MeResponse } from "@/lib/api/me";
import { createBrowserAuthedClient } from "@/lib/auth";
import type { components, operations } from "@/lib/openapi/schema";

export type AccountSession = components["schemas"]["AccountSessionResource"];

export type AccountSessionsResponse =
	operations["account.listAccountSessions"]["responses"]["200"]["content"]["application/json"];

export type UpdateAccountProfileBody =
	components["schemas"]["UpdateAccountProfileData"];

export type ChangeAccountPasswordBody =
	components["schemas"]["ChangeAccountPasswordData"];

export async function updateAccountProfile(
	body: UpdateAccountProfileBody,
): Promise<MeResponse> {
	return createBrowserAuthedClient()
		.patch("api/v1/account/profile", { json: body })
		.json<MeResponse>();
}

export async function updateAccountPassword(
	body: ChangeAccountPasswordBody,
): Promise<void> {
	await createBrowserAuthedClient()
		.put("api/v1/account/password", { json: body })
		.json();
}

export async function logoutApi(): Promise<void> {
	await createBrowserAuthedClient().post("api/v1/auth/logout");
}

export async function listAccountSessions(): Promise<AccountSessionsResponse> {
	return createBrowserAuthedClient()
		.get("api/v1/account/sessions")
		.json<AccountSessionsResponse>();
}

export async function revokeAccountSession(tokenId: number): Promise<void> {
	await createBrowserAuthedClient().delete(
		`api/v1/account/sessions/${tokenId}`,
	);
}

export async function revokeAllAccountSessions(): Promise<void> {
	await createBrowserAuthedClient().delete("api/v1/account/sessions");
}
