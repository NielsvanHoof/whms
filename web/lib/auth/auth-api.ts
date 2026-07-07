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

export type ForgotPasswordBody = {
	email: string;
};

export type ForgotPasswordResponse = {
	message: string;
};

export type ResetPasswordBody = {
	email: string;
	token: string;
	password: string;
	password_confirmation: string;
};

export type ResetPasswordResponse = {
	message: string;
};

export async function forgotPassword(
	body: ForgotPasswordBody,
): Promise<ForgotPasswordResponse> {
	const client = createHttpClient();
	return client
		.post("api/v1/auth/forgot-password", { json: body })
		.json<ForgotPasswordResponse>();
}

export async function resetPassword(
	body: ResetPasswordBody,
): Promise<ResetPasswordResponse> {
	const client = createHttpClient();
	return client
		.post("api/v1/auth/reset-password", { json: body })
		.json<ResetPasswordResponse>();
}
