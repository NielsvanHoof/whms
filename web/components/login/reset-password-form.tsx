"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { WarehouseIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { resetPassword } from "@/lib/auth/auth-api";
import { handleMutationFormError } from "@/lib/forms/handle-mutation-form-error";
import {
	type ResetPasswordFormValues,
	resetPasswordSchema,
} from "@/lib/schemas/password-reset";
import { cn } from "@/lib/utils";

type ResetPasswordFormProps = {
	className?: string;
	defaultEmail?: string;
	defaultToken?: string;
};

export function ResetPasswordForm({
	className,
	defaultEmail = "",
	defaultToken = "",
}: ResetPasswordFormProps) {
	const router = useRouter();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			email: defaultEmail,
			token: defaultToken,
			password: "",
			passwordConfirmation: "",
		},
	});

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = form;

	return (
		<div className={cn("relative z-10 w-full max-w-md", className)}>
			<Card className="border-border/80 shadow-md ring-foreground/10">
				<CardHeader className="flex flex-col gap-3">
					<div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
						<WarehouseIcon aria-hidden className="size-6" />
					</div>
					<div className="flex flex-col gap-1">
						<CardTitle className="font-[family-name:var(--font-geist-sans)] text-xl tracking-tight">
							Choose a new password
						</CardTitle>
						<CardDescription>
							Enter a new password for your account.
						</CardDescription>
					</div>
				</CardHeader>
				<form
					noValidate
					onSubmit={handleSubmit(async (values) => {
						setFormError(null);
						try {
							await resetPassword({
								email: values.email,
								token: values.token,
								password: values.password,
								password_confirmation: values.passwordConfirmation,
							});
							router.replace("/login");
						} catch (err) {
							await handleMutationFormError({
								err,
								setError,
								setFormError,
								fields: {
									email: "email",
									token: "token",
									password: "password",
									password_confirmation: "passwordConfirmation",
								},
								messages: {
									validationFallback: "Could not reset password.",
									generic: "Could not reset password. Please try again.",
								},
							});
						}
					})}
				>
					<CardContent className="flex flex-col gap-6">
						{formError ? (
							<Alert variant="destructive">
								<AlertTitle>Reset failed</AlertTitle>
								<AlertDescription>{formError}</AlertDescription>
							</Alert>
						) : null}
						<FieldGroup className="gap-5">
							<Field data-invalid={errors.email ? "true" : undefined}>
								<FieldLabel htmlFor="reset-email">Email</FieldLabel>
								<Input
									autoComplete="email"
									id="reset-email"
									readOnly={Boolean(defaultEmail)}
									type="email"
									{...register("email")}
								/>
								<FieldError>{errors.email?.message}</FieldError>
							</Field>
							<input type="hidden" {...register("token")} />
							<Field data-invalid={errors.password ? "true" : undefined}>
								<FieldLabel htmlFor="reset-password">New password</FieldLabel>
								<Input
									autoComplete="new-password"
									id="reset-password"
									type="password"
									{...register("password")}
								/>
								<FieldError>{errors.password?.message}</FieldError>
							</Field>
							<Field
								data-invalid={errors.passwordConfirmation ? "true" : undefined}
							>
								<FieldLabel htmlFor="reset-password-confirm">
									Confirm password
								</FieldLabel>
								<Input
									autoComplete="new-password"
									id="reset-password-confirm"
									type="password"
									{...register("passwordConfirmation")}
								/>
								<FieldError>{errors.passwordConfirmation?.message}</FieldError>
							</Field>
						</FieldGroup>
					</CardContent>
					<CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-6">
						<Button className="w-full" disabled={isSubmitting} type="submit">
							{isSubmitting ? (
								<Spinner aria-hidden data-icon="inline-start" />
							) : null}
							Update password
						</Button>
						<Button asChild className="w-full" type="button" variant="outline">
							<Link href="/login">Back to sign in</Link>
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
