"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HTTPError } from "ky";
import { WarehouseIcon } from "lucide-react";
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
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { login, writeStoredAuthSessionFromLogin } from "@/lib/auth";
import type { components } from "@/lib/openapi/schema";
import { type LoginFormValues, loginFormSchema } from "@/lib/schemas/login";
import { cn } from "@/lib/utils";

type ValidationBody =
	components["responses"]["ValidationException"]["content"]["application/json"];

export function LoginForm({ className }: { className?: string }) {
	const router = useRouter();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: { email: "", password: "" },
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
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
							Warehouse
						</CardTitle>
						<CardDescription>
							Sign in with your tenant account to continue.
						</CardDescription>
					</div>
				</CardHeader>
				<form
					noValidate
					onSubmit={handleSubmit(async (values) => {
						setFormError(null);
						clearErrors(["email", "password"]);
						try {
							const result = await login({
								...values,
								device_name: "Warehouse Web",
							});
							writeStoredAuthSessionFromLogin(result);
							router.replace("/dashboard");
							router.refresh();
						} catch (err) {
							if (err instanceof HTTPError && err.response.status === 422) {
								const raw = err.data;
								const body =
									raw && typeof raw === "object"
										? (raw as ValidationBody)
										: undefined;

								if (!body) {
									setFormError("Could not sign in.");
									return;
								}
								const apiErrors = body.errors;
								if (apiErrors?.email?.[0]) {
									setError("email", {
										type: "server",
										message: apiErrors.email[0],
									});
								}
								if (apiErrors?.password?.[0]) {
									setError("password", {
										type: "server",
										message: apiErrors.password[0],
									});
								}
								if (!apiErrors?.email?.[0] && !apiErrors?.password?.[0]) {
									setFormError(body.message ?? "Could not sign in.");
								}
								return;
							}
							if (err instanceof HTTPError) {
								setFormError(
									`Could not sign in (${err.response.status}). Try again.`,
								);
								return;
							}
							setFormError(
								"Network error. Check that the API is running and try again.",
							);
						}
					})}
				>
					<CardContent className="flex flex-col gap-6">
						{formError ? (
							<Alert variant="destructive">
								<AlertTitle>Sign-in failed</AlertTitle>
								<AlertDescription>{formError}</AlertDescription>
							</Alert>
						) : null}
						<FieldGroup className="gap-5">
							<Field data-invalid={errors.email ? "true" : undefined}>
								<FieldLabel htmlFor="login-email">Email</FieldLabel>
								<Input
									autoComplete="email"
									id="login-email"
									inputMode="email"
									placeholder="you@company.com"
									type="email"
									aria-invalid={errors.email ? true : undefined}
									{...register("email")}
								/>
								<FieldError>{errors.email?.message}</FieldError>
							</Field>
							<Field data-invalid={errors.password ? "true" : undefined}>
								<FieldLabel htmlFor="login-password">Password</FieldLabel>
								<Input
									autoComplete="current-password"
									id="login-password"
									type="password"
									aria-invalid={errors.password ? true : undefined}
									{...register("password")}
								/>
								<FieldDescription>
									Use the password from your warehouse administrator.
								</FieldDescription>
								<FieldError>{errors.password?.message}</FieldError>
							</Field>
						</FieldGroup>
					</CardContent>
					<CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-6">
						<Button className="w-full" disabled={isSubmitting} type="submit">
							{isSubmitting ? (
								<Spinner aria-hidden data-icon="inline-start" />
							) : null}
							Sign in
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
