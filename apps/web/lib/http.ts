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
	onUnauthorized?: () => void;
};

function readCookie(name: string): string | null {
	if (typeof document === "undefined") {
		return null;
	}

	const cookie = document.cookie
		.split("; ")
		.find((entry) => entry.startsWith(`${name}=`));

	if (!cookie) {
		return null;
	}

	return decodeURIComponent(cookie.slice(name.length + 1));
}

function isUnsafeMethod(method: string): boolean {
	return !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

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
					if (isUnsafeMethod(state.request.method)) {
						const xsrfToken = readCookie("XSRF-TOKEN");
						if (xsrfToken) {
							state.request.headers.set("X-XSRF-TOKEN", xsrfToken);
						}
					}
				},
			],
			afterResponse: [
				({ response }) => {
					if (response.status === 401 || response.status === 419) {
						options?.onUnauthorized?.();
					}
				},
			],
		},
	});
}
