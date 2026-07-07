"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { createAccessUser } from "@/lib/api/access";
import { handleMutationFormError } from "@/lib/forms/handle-mutation-form-error";
import { accessQueryKeys, accessRolesQueryOptions } from "@/lib/queries/access";
import {
	type UserCreateFormValues,
	userCreateSchema,
} from "@/lib/schemas/user-create";
import { toastSuccess } from "@/lib/toast";

export function UserCreateForm() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const rolesQuery = useQuery(accessRolesQueryOptions());
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<UserCreateFormValues>({
		resolver: zodResolver(userCreateSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			passwordConfirmation: "",
			roles: ["viewer"],
		},
	});

	const {
		register,
		handleSubmit,
		setError,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = form;

	const selectedRoles = watch("roles");

	const mutation = useMutation({
		mutationFn: createAccessUser,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: accessQueryKeys.users(),
			});
			toastSuccess("User created");
			router.push("/admin/users");
		},
	});

	const roles = rolesQuery.data?.data ?? [];

	return (
		<Card className="max-w-2xl">
			<form
				noValidate
				onSubmit={handleSubmit(async (values) => {
					setFormError(null);
					try {
						await mutation.mutateAsync({
							name: values.name,
							email: values.email,
							password: values.password,
							password_confirmation: values.passwordConfirmation,
							roles: values.roles,
						});
					} catch (err) {
						await handleMutationFormError({
							err,
							setError,
							setFormError,
							fields: {
								name: "name",
								email: "email",
								password: "password",
								password_confirmation: "passwordConfirmation",
								"roles.0": "roles",
							},
							messages: {
								validationFallback: "Could not create user.",
								generic: "Could not create user. Please try again.",
							},
						});
					}
				})}
			>
				<CardContent className="flex flex-col gap-4 pt-6">
					{formError ? (
						<Alert variant="destructive">
							<AlertTitle>Create failed</AlertTitle>
							<AlertDescription>{formError}</AlertDescription>
						</Alert>
					) : null}
					<FieldGroup>
						<Field data-invalid={errors.name ? "true" : undefined}>
							<FieldLabel htmlFor="user-name">Display name</FieldLabel>
							<Input id="user-name" {...register("name")} />
							<FieldError>{errors.name?.message}</FieldError>
						</Field>
						<Field data-invalid={errors.email ? "true" : undefined}>
							<FieldLabel htmlFor="user-email">Email</FieldLabel>
							<Input
								autoComplete="off"
								id="user-email"
								type="email"
								{...register("email")}
							/>
							<FieldError>{errors.email?.message}</FieldError>
						</Field>
						<Field data-invalid={errors.password ? "true" : undefined}>
							<FieldLabel htmlFor="user-password">Password</FieldLabel>
							<Input
								autoComplete="new-password"
								id="user-password"
								type="password"
								{...register("password")}
							/>
							<FieldError>{errors.password?.message}</FieldError>
						</Field>
						<Field
							data-invalid={errors.passwordConfirmation ? "true" : undefined}
						>
							<FieldLabel htmlFor="user-password-confirm">
								Confirm password
							</FieldLabel>
							<Input
								autoComplete="new-password"
								id="user-password-confirm"
								type="password"
								{...register("passwordConfirmation")}
							/>
							<FieldError>{errors.passwordConfirmation?.message}</FieldError>
						</Field>
						<Field data-invalid={errors.roles ? "true" : undefined}>
							<FieldLabel htmlFor="user-role">Role</FieldLabel>
							<Select
								onValueChange={(value) => {
									setValue("roles", [value], {
										shouldDirty: true,
										shouldValidate: true,
									});
								}}
								value={selectedRoles[0] ?? ""}
							>
								<SelectTrigger className="w-full" id="user-role">
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									{roles.map((role) => (
										<SelectItem key={role.id} value={role.name}>
											{role.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldError>{errors.roles?.message}</FieldError>
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex gap-2 border-t border-border/60 pt-6">
					<Button disabled={isSubmitting} type="submit">
						{isSubmitting ? (
							<Spinner aria-hidden data-icon="inline-start" />
						) : null}
						Create user
					</Button>
					<Button asChild type="button" variant="outline">
						<Link href="/admin/users">Cancel</Link>
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
