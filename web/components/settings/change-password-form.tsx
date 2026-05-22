"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { updateAccountPassword } from "@/lib/api/account";
import { handleMutationFormError } from "@/lib/forms/handle-mutation-form-error";
import {
	type AccountPasswordFormValues,
	accountPasswordSchema,
} from "@/lib/schemas/account-password";
import { toastSuccess } from "@/lib/toast";

export function ChangePasswordForm() {
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<AccountPasswordFormValues>({
		resolver: zodResolver(accountPasswordSchema),
		defaultValues: {
			current_password: "",
			password: "",
			password_confirmation: "",
		},
	});

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = form;

	const mutation = useMutation({
		mutationFn: updateAccountPassword,
	});

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle>Password</CardTitle>
				<CardDescription>
					Choose a strong password you do not use elsewhere.
				</CardDescription>
			</CardHeader>
			<form
				noValidate
				onSubmit={handleSubmit(async (values) => {
					setFormError(null);
					try {
						await mutation.mutateAsync({
							current_password: values.current_password,
							password: values.password,
							password_confirmation: values.password_confirmation,
						});
						reset();
						toastSuccess("Password updated");
					} catch (err) {
						await handleMutationFormError({
							err,
							setError,
							setFormError,
							fields: {
								current_password: "current_password",
								password: "password",
								password_confirmation: "password_confirmation",
							},
							messages: {
								validationFallback: "Could not change password.",
								generic: "Could not change password. Please try again.",
							},
						});
					}
				})}
			>
				<CardContent className="flex flex-col gap-4">
					{formError ? (
						<Alert variant="destructive">
							<AlertTitle>Update failed</AlertTitle>
							<AlertDescription>{formError}</AlertDescription>
						</Alert>
					) : null}
					<FieldGroup className="gap-4">
						<Field data-invalid={errors.current_password ? "true" : undefined}>
							<FieldLabel htmlFor="settings-current-password">
								Current password
							</FieldLabel>
							<Input
								autoComplete="current-password"
								id="settings-current-password"
								type="password"
								aria-invalid={errors.current_password ? true : undefined}
								{...register("current_password")}
							/>
							<FieldError>{errors.current_password?.message}</FieldError>
						</Field>
						<Field data-invalid={errors.password ? "true" : undefined}>
							<FieldLabel htmlFor="settings-new-password">
								New password
							</FieldLabel>
							<Input
								autoComplete="new-password"
								id="settings-new-password"
								type="password"
								aria-invalid={errors.password ? true : undefined}
								{...register("password")}
							/>
							<FieldDescription>At least 8 characters.</FieldDescription>
							<FieldError>{errors.password?.message}</FieldError>
						</Field>
						<Field
							data-invalid={errors.password_confirmation ? "true" : undefined}
						>
							<FieldLabel htmlFor="settings-password-confirmation">
								Confirm new password
							</FieldLabel>
							<Input
								autoComplete="new-password"
								id="settings-password-confirmation"
								type="password"
								aria-invalid={errors.password_confirmation ? true : undefined}
								{...register("password_confirmation")}
							/>
							<FieldError>{errors.password_confirmation?.message}</FieldError>
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter className="border-t border-border/60 pt-6">
					<Button disabled={isSubmitting} type="submit">
						{isSubmitting ? (
							<Spinner aria-hidden data-icon="inline-start" />
						) : null}
						Update password
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
