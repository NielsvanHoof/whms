"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { Building2Icon } from "lucide-react";
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
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { createWarehouse } from "@/lib/api/warehouses";
import type { components } from "@/lib/openapi/schema";
import { warehouseQueryKeys } from "@/lib/queries/warehouses";
import {
	type WarehouseCreateFormValues,
	warehouseCreateSchema,
} from "@/lib/schemas/warehouse-create";

type ValidationBody =
	components["responses"]["ValidationException"]["content"]["application/json"];

export function CreateWarehouseForm() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<WarehouseCreateFormValues>({
		resolver: zodResolver(warehouseCreateSchema),
		defaultValues: { name: "", code: "" },
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	const createMutation = useMutation({
		mutationFn: createWarehouse,
	});

	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors, isSubmitting },
	} = form;

	return (
		<Card className="max-w-xl">
			<CardHeader className="flex flex-col gap-3">
				<div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
					<Building2Icon aria-hidden className="size-5" />
				</div>
				<div className="flex flex-col gap-1">
					<CardTitle>Create warehouse</CardTitle>
					<CardDescription>
						Add a new tenant warehouse location. Name is required.
					</CardDescription>
				</div>
			</CardHeader>
			<form
				noValidate
				onSubmit={handleSubmit(async (values) => {
					setFormError(null);
					clearErrors(["name", "code"]);

					try {
						await createMutation.mutateAsync({
							name: values.name,
							code: values.code.trim().length ? values.code.trim() : null,
						});
						await queryClient.invalidateQueries({
							queryKey: warehouseQueryKeys.all,
						});
						router.push("/warehouses");
						router.refresh();
					} catch (err) {
						if (err instanceof HTTPError && err.response.status === 422) {
							const raw = err.data;
							const body =
								raw && typeof raw === "object"
									? (raw as ValidationBody)
									: undefined;

							if (!body) {
								setFormError("Could not create warehouse.");
								return;
							}

							const apiErrors = body.errors;
							if (apiErrors?.name?.[0]) {
								setError("name", {
									type: "server",
									message: apiErrors.name[0],
								});
							}
							if (apiErrors?.code?.[0]) {
								setError("code", {
									type: "server",
									message: apiErrors.code[0],
								});
							}
							if (!apiErrors?.name?.[0] && !apiErrors?.code?.[0]) {
								setFormError(body.message ?? "Could not create warehouse.");
							}
							return;
						}

						if (err instanceof HTTPError) {
							setFormError(
								`Could not create warehouse (${err.response.status}). Try again.`,
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
							<AlertTitle>Create failed</AlertTitle>
							<AlertDescription>{formError}</AlertDescription>
						</Alert>
					) : null}

					<FieldGroup className="gap-5">
						<Field data-invalid={errors.name ? "true" : undefined}>
							<FieldLabel htmlFor="warehouse-name">Name</FieldLabel>
							<Input
								id="warehouse-name"
								placeholder="Main Distribution Center"
								aria-invalid={errors.name ? true : undefined}
								{...register("name")}
							/>
							<FieldError>{errors.name?.message}</FieldError>
						</Field>

						<Field data-invalid={errors.code ? "true" : undefined}>
							<FieldLabel htmlFor="warehouse-code">Code</FieldLabel>
							<Input
								id="warehouse-code"
								placeholder="MDC-01"
								aria-invalid={errors.code ? true : undefined}
								{...register("code")}
							/>
							<FieldDescription>
								Optional short identifier used in listings and integrations.
							</FieldDescription>
							<FieldError>{errors.code?.message}</FieldError>
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex gap-2 border-t border-border/60 pt-6">
					<Button asChild type="button" variant="outline">
						<Link href="/warehouses">Cancel</Link>
					</Button>
					<Button disabled={isSubmitting} type="submit">
						{isSubmitting ? (
							<Spinner aria-hidden data-icon="inline-start" />
						) : null}
						Create warehouse
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
