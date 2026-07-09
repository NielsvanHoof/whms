import { HTTPError } from "ky";

/** True when the API rejected the session (logged out or CSRF mismatch). */
export function isUnauthorizedError(error: unknown): boolean {
	if (!(error instanceof HTTPError)) {
		return false;
	}

	return error.response.status === 401 || error.response.status === 419;
}
