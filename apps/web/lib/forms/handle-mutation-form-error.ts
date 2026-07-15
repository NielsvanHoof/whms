import { HTTPError } from "ky";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import type { components } from "@/lib/openapi/schema";
import { toastApiError } from "@/lib/toast";

export type ValidationBody =
	components["responses"]["ValidationException"]["content"]["application/json"];

/** Parse Laravel validation JSON from a Ky HTTPError (parsed body or response). */
export async function getValidationBody(
	err: HTTPError,
): Promise<ValidationBody | undefined> {
	const raw = err.data;
	if (raw && typeof raw === "object") {
		return raw as ValidationBody;
	}

	try {
		return (await err.response.json()) as ValidationBody;
	} catch {
		return undefined;
	}
}

export type HandleMutationFormErrorOptions<TFieldValues extends FieldValues> = {
	err: unknown;
	setError: UseFormSetError<TFieldValues>;
	setFormError: (message: string) => void;
	/** Laravel validation keys → react-hook-form paths */
	fields: Record<string, Path<TFieldValues>>;
	messages: {
		validationFallback: string;
		generic?: string;
		http?: (status: number) => string;
		network?: string;
	};
	/** Default true — login sets false */
	toastNonValidationErrors?: boolean;
};

/**
 * Maps API 422 errors to RHF field errors and banner text; handles other failures with optional toast.
 */
export async function handleMutationFormError<TFieldValues extends FieldValues>(
	options: HandleMutationFormErrorOptions<TFieldValues>,
): Promise<void> {
	const {
		err,
		setError,
		setFormError,
		fields,
		messages,
		toastNonValidationErrors = true,
	} = options;

	if (err instanceof HTTPError && err.response.status === 422) {
		const body = await getValidationBody(err);

		if (!body) {
			setFormError(messages.validationFallback);
			return;
		}

		let appliedFieldError = false;
		for (const [apiKey, formPath] of Object.entries(fields)) {
			const apiErrors = body.errors as
				| Record<string, string[] | undefined>
				| undefined;
			const message = apiErrors?.[apiKey]?.[0];
			if (message) {
				setError(formPath, { type: "server", message });
				appliedFieldError = true;
			}
		}

		if (!appliedFieldError) {
			setFormError(body.message ?? messages.validationFallback);
		}
		return;
	}

	const toastFallback = messages.generic ?? messages.validationFallback;

	if (err instanceof HTTPError) {
		const status = err.response.status;
		const formMessage =
			messages.http?.(status) ??
			messages.generic ??
			`${messages.validationFallback} (${status}). Try again.`;

		if (toastNonValidationErrors) {
			await toastApiError(err, toastFallback);
		}
		setFormError(formMessage);
		return;
	}

	const networkMessage =
		messages.network ??
		messages.generic ??
		"Network error. Check that the API is running and try again.";

	if (toastNonValidationErrors) {
		await toastApiError(err, toastFallback);
	}
	setFormError(networkMessage);
}
