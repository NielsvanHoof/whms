import { createBrowserAuthedClient } from "@/lib/auth";
import type { components } from "@/lib/openapi/schema";

export type TenantResource = components["schemas"]["TenantResource"];

export type UpdateTenantBody = {
	name?: string;
	slug?: string;
};

export type UpdateTenantResponse = {
	data: TenantResource;
};

export async function updateTenant(
	body: UpdateTenantBody,
): Promise<UpdateTenantResponse> {
	return createBrowserAuthedClient()
		.patch("api/v1/tenant", { json: body })
		.json<UpdateTenantResponse>();
}
