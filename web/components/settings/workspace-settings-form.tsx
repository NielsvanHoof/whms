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
import { updateTenant } from "@/lib/api/tenant";
import { handleMutationFormError } from "@/lib/forms/handle-mutation-form-error";
import { meQueryKeys } from "@/lib/queries/me";
import {
	type WorkspaceSettingsFormValues,
	workspaceSettingsSchema,
} from "@/lib/schemas/workspace-settings";
import { toastSuccess } from "@/lib/toast";

type WorkspaceSettingsFormProps = {
	defaultName: string;
	defaultSlug: string;
};

export function WorkspaceSettingsForm({
	defaultName,
	defaultSlug,
}: WorkspaceSettingsFormProps) {
	const queryClient = useQueryClient();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<WorkspaceSettingsFormValues>({
		resolver: zodResolver(workspaceSettingsSchema),
		defaultValues: { name: defaultName, slug: defaultSlug },
	});

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting, isDirty },
	} = form;

	useEffect(() => {
		reset({ name: defaultName, slug: defaultSlug });
	}, [defaultName, defaultSlug, reset]);

	const mutation = useMutation({
		mutationFn: updateTenant,
		onSuccess: async (response) => {
			setFormError(null);
			await queryClient.invalidateQueries({ queryKey: meQueryKeys.all });
			reset({
				name: response.data.name,
				slug: response.data.slug,
			});
			toastSuccess("Workspace updated");
		},
	});

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle>General</CardTitle>
				<CardDescription>
					Basic workspace identity for your tenant.
				</CardDescription>
			</CardHeader>
			<form
				noValidate
				onSubmit={handleSubmit(async (values) => {
					setFormError(null);
					try {
						await mutation.mutateAsync(values);
					} catch (err) {
						await handleMutationFormError({
							err,
							setError,
							setFormError,
							fields: { name: "name", slug: "slug" },
							messages: {
								validationFallback: "Could not update workspace.",
								generic: "Could not update workspace. Please try again.",
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
							<FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
							<Input
								id="workspace-name"
								aria-invalid={errors.name ? true : undefined}
								{...register("name")}
							/>
							<FieldError>{errors.name?.message}</FieldError>
						</Field>
						<Field data-invalid={errors.slug ? "true" : undefined}>
							<FieldLabel htmlFor="workspace-slug">Slug</FieldLabel>
							<Input
								className="font-mono"
								id="workspace-slug"
								aria-invalid={errors.slug ? true : undefined}
								{...register("slug")}
							/>
							<FieldError>{errors.slug?.message}</FieldError>
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter className="border-t border-border/60 pt-6">
					<Button disabled={isSubmitting || !isDirty} type="submit">
						{isSubmitting ? (
							<Spinner aria-hidden data-icon="inline-start" />
						) : null}
						Save workspace
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
