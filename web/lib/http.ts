import ky, { type KyInstance } from "ky";

/**
 * Ensures NEXT_PUBLIC_API_URL is suitable as Ky `baseUrl` (trailing slash).
 * Ky recommends a trailing slash when the base includes a path segment.
 */
function apiBaseUrl(): string {
	const raw = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
	if (!raw) {
		return "";
	}
	return raw.endsWith("/") ? raw : `${raw}/`;
}

export type CreateHttpClientOptions = {
	/**
	 * When set, non-empty values become `Authorization: Bearer …` on each request.
	 * Omit for unauthenticated calls (e.g. login).
	 */
	getToken?: () => string | null;
};

/**
 * Shared HTTP client for the Laravel API.
 * Relative paths resolve against NEXT_PUBLIC_API_URL (e.g. api/v1/...).
 */
export function createHttpClient(
	options?: CreateHttpClientOptions,
): KyInstance {
	const baseUrl = apiBaseUrl();

	return ky.create({
		baseUrl,
		headers: {
			Accept: "application/json",
		},
		credentials: "include",
		hooks: {
			beforeRequest: [
				(state) => {
					const token = options?.getToken?.() ?? null;
					if (token) {
						state.request.headers.set("Authorization", `Bearer ${token}`);
					}
				},
			],
		},
	});
}
