"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { updateAccountProfile } from "@/lib/api/account";
import { handleMutationFormError } from "@/lib/forms/handle-mutation-form-error";
import { meQueryKeys } from "@/lib/queries/me";
import {
	type AccountProfileFormValues,
	accountProfileSchema,
} from "@/lib/schemas/account-profile";
import { toastSuccess } from "@/lib/toast";

type AccountProfileFormProps = {
	defaultName: string;
};

export function AccountProfileForm({ defaultName }: AccountProfileFormProps) {
	const queryClient = useQueryClient();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<AccountProfileFormValues>({
		resolver: zodResolver(accountProfileSchema),
		defaultValues: { name: defaultName },
	});

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting, isDirty },
	} = form;

	useEffect(() => {
		reset({ name: defaultName });
	}, [defaultName, reset]);

	const mutation = useMutation({
		mutationFn: updateAccountProfile,
		onSuccess: async (response) => {
			setFormError(null);
			queryClient.setQueryData(meQueryKeys.all, response);
			reset({ name: response.data.user.name });
			toastSuccess("Profile updated");
		},
	});

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>
					Update how your name appears in the app. Email is managed by your
					administrator.
				</CardDescription>
			</CardHeader>
			<form
				noValidate
				onSubmit={handleSubmit(async (values) => {
					setFormError(null);
					try {
						await mutation.mutateAsync({ name: values.name });
					} catch (err) {
						await handleMutationFormError({
							err,
							setError,
							setFormError,
							fields: { name: "name" },
							messages: {
								validationFallback: "Could not update profile.",
								generic: "Could not update profile. Please try again.",
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
					<FieldGroup>
						<Field data-invalid={errors.name ? "true" : undefined}>
							<FieldLabel htmlFor="settings-name">Display name</FieldLabel>
							<Input
								id="settings-name"
								aria-invalid={errors.name ? true : undefined}
								{...register("name")}
							/>
							<FieldError>{errors.name?.message}</FieldError>
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter className="border-t border-border/60 pt-6">
					<Button disabled={isSubmitting || !isDirty} type="submit">
						{isSubmitting ? (
							<Spinner aria-hidden data-icon="inline-start" />
						) : null}
						Save profile
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
