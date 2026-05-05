import type { components, operations } from "@/lib/openapi/schema";
import { createHttpClient } from "../http";

export type LoginRequestBody = components["schemas"]["LoginData"];

export type AuthUser = components["schemas"]["UserResource"];

export type LoginResponse =
	operations["auth.login"]["responses"]["200"]["content"]["application/json"];

export async function login(body: LoginRequestBody): Promise<LoginResponse> {
	const client = createHttpClient();
	return client.post("api/v1/auth/login", { json: body }).json<LoginResponse>();
}
