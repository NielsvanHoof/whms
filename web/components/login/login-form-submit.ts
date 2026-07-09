import type { useRouter } from "next/navigation";
import type { UseFormClearErrors, UseFormSetError } from "react-hook-form";
import { login, notifyAuthSessionChanged } from "@/lib/auth";
import { handleMutationFormError } from "@/lib/forms/handle-mutation-form-error";
import type { LoginFormValues } from "@/lib/schemas/login";

type Router = ReturnType<typeof useRouter>;

export type LoginSubmitContext = {
	router: Router;
	setFormError: (message: string | null) => void;
	clearErrors: UseFormClearErrors<LoginFormValues>;
	setError: UseFormSetError<LoginFormValues>;
};

export async function submitLogin(
	values: LoginFormValues,
	ctx: LoginSubmitContext,
): Promise<void> {
	ctx.setFormError(null);
	ctx.clearErrors(["email", "password"]);

	try {
		await login({
			...values,
			device_name: "Warehouse Web",
		});
		notifyAuthSessionChanged();
		ctx.router.replace("/dashboard");
		ctx.router.refresh();
	} catch (err) {
		await handleMutationFormError({
			err,
			setError: ctx.setError,
			setFormError: ctx.setFormError,
			fields: { email: "email", password: "password" },
			messages: {
				validationFallback: "Could not sign in.",
				http: (status) => `Could not sign in (${status}). Try again.`,
				network: "Network error. Check that the API is running and try again.",
			},
			toastNonValidationErrors: false,
		});
	}
}
