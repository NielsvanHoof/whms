"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { WarehouseIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
	type LoginSubmitContext,
	submitLogin,
} from "@/components/login/login-form-submit";
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
import { type LoginFormValues, loginFormSchema } from "@/lib/schemas/login";
import { cn } from "@/lib/utils";

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

	const submitCtx = useMemo<LoginSubmitContext>(
		() => ({
			router,
			setFormError,
			clearErrors,
			setError,
		}),
		[router, clearErrors, setError],
	);

	const onValidSubmit = useCallback(
		(values: LoginFormValues) => submitLogin(values, submitCtx),
		[submitCtx],
	);

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
				<form method="post" noValidate onSubmit={handleSubmit(onValidSubmit)}>
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
									Use the password from your warehouse administrator.{" "}
									<Link
										className="text-foreground underline underline-offset-4"
										href="/forgot-password"
									>
										Forgot password?
									</Link>
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
