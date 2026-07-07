"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { WarehouseIcon } from "lucide-react";
import Link from "next/link";
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
import { forgotPassword } from "@/lib/auth/auth-api";
import { handleMutationFormError } from "@/lib/forms/handle-mutation-form-error";
import {
	type ForgotPasswordFormValues,
	forgotPasswordSchema,
} from "@/lib/schemas/password-reset";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm({ className }: { className?: string }) {
	const [formError, setFormError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: "" },
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
							Reset password
						</CardTitle>
						<CardDescription>
							Enter your email and we will send a reset link if the account
							exists.
						</CardDescription>
					</div>
				</CardHeader>
				<form
					noValidate
					onSubmit={handleSubmit(async (values) => {
						setFormError(null);
						setSuccessMessage(null);
						try {
							const response = await forgotPassword(values);
							setSuccessMessage(response.message);
						} catch (err) {
							await handleMutationFormError({
								err,
								setError,
								setFormError,
								fields: { email: "email" },
								messages: {
									validationFallback: "Could not send reset link.",
									generic: "Could not send reset link. Please try again.",
								},
							});
						}
					})}
				>
					<CardContent className="flex flex-col gap-6">
						{formError ? (
							<Alert variant="destructive">
								<AlertTitle>Request failed</AlertTitle>
								<AlertDescription>{formError}</AlertDescription>
							</Alert>
						) : null}
						{successMessage ? (
							<Alert>
								<AlertTitle>Check your email</AlertTitle>
								<AlertDescription>{successMessage}</AlertDescription>
							</Alert>
						) : null}
						<FieldGroup className="gap-5">
							<Field data-invalid={errors.email ? "true" : undefined}>
								<FieldLabel htmlFor="forgot-email">Email</FieldLabel>
								<Input
									autoComplete="email"
									id="forgot-email"
									type="email"
									{...register("email")}
								/>
								<FieldError>{errors.email?.message}</FieldError>
							</Field>
						</FieldGroup>
					</CardContent>
					<CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-6">
						<Button className="w-full" disabled={isSubmitting} type="submit">
							{isSubmitting ? (
								<Spinner aria-hidden data-icon="inline-start" />
							) : null}
							Send reset link
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
