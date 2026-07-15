import { HTTPError } from "ky";
import { toast } from "sonner";

type ApiErrorBody = {
	message?: string;
	errors?: Record<string, string[]>;
};

/** Extract a user-facing message from Laravel API errors. */
export async function getApiErrorMessage(
	error: unknown,
	fallback = "Something went wrong.",
): Promise<string> {
	if (error instanceof HTTPError) {
		try {
			const body = (await error.response.json()) as ApiErrorBody;
			const fieldErrors = body.errors
				? Object.values(body.errors).flat().join(" ")
				: "";
			const message = [body.message, fieldErrors].filter(Boolean).join(" — ");
			if (message) {
				return message;
			}
		} catch {
			// Response body was not JSON.
		}
		return fallback;
	}
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return fallback;
}

export function toastSuccess(message: string): void {
	toast.success(message);
}

export function toastError(message: string): void {
	toast.error(message);
}

export async function toastApiError(
	error: unknown,
	fallback?: string,
): Promise<void> {
	toast.error(await getApiErrorMessage(error, fallback));
}
