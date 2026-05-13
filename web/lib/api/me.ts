import { createBrowserAuthedClient } from "@/lib/auth";
import type { operations } from "@/lib/openapi/schema";

export type MeResponse =
	operations["auth.me"]["responses"]["200"]["content"]["application/json"];
export type MeResource = MeResponse["data"];

export async function getMe(): Promise<MeResponse> {
	return createBrowserAuthedClient().get("api/v1/me").json<MeResponse>();
}
