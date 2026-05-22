"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
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
import {
	submitWarehouseForm,
	type WarehouseFormSubmitContext,
} from "@/components/warehouses/warehouse-form-submit";
import {
	createWarehouse,
	type UpdateWarehouseRequestBody,
	updateWarehouse,
} from "@/lib/api/warehouses";
import {
	type WarehouseCreateFormValues,
	warehouseCreateSchema,
} from "@/lib/schemas/warehouse-create";

type WarehouseFormProps = {
	mode: "create" | "edit";
	warehouseId?: number;
	defaultValues?: Partial<WarehouseCreateFormValues>;
};

export function WarehouseForm({
	mode,
	warehouseId,
	defaultValues,
}: WarehouseFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<WarehouseCreateFormValues>({
		resolver: zodResolver(warehouseCreateSchema),
		defaultValues: {
			name: defaultValues?.name ?? "",
			code: defaultValues?.code ?? "",
		},
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	const createMutation = useMutation({
		mutationFn: createWarehouse,
	});
	const updateMutation = useMutation({
		mutationFn: (body: Omit<UpdateWarehouseRequestBody, "warehouse_id">) => {
			if (!warehouseId) {
				throw new Error("Missing warehouse id");
			}
			return updateWarehouse(warehouseId, body);
		},
	});

	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors, isSubmitting },
	} = form;

	const submitCtx = useMemo<WarehouseFormSubmitContext>(
		() => ({
			mode,
			warehouseId,
			router,
			queryClient,
			createMutation,
			updateMutation,
			setFormError,
			clearErrors,
			setError,
		}),
		[
			mode,
			warehouseId,
			router,
			queryClient,
			createMutation,
			updateMutation,
			clearErrors,
			setError,
		],
	);

	const onValidSubmit = useCallback(
		(values: WarehouseCreateFormValues) =>
			submitWarehouseForm(values, submitCtx),
		[submitCtx],
	);

	const isCreate = mode === "create";

	return (
		<Card className="max-w-xl">
			<CardHeader className="flex flex-col gap-3">
				<div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
					<Building2Icon aria-hidden className="size-5" />
				</div>
				<div className="flex flex-col gap-1">
					<CardTitle>
						{isCreate ? "Create warehouse" : "Edit warehouse"}
					</CardTitle>
					<CardDescription>
						{isCreate
							? "Add a new tenant warehouse location. Name is required."
							: "Update warehouse name or code."}
					</CardDescription>
				</div>
			</CardHeader>
			<form noValidate onSubmit={handleSubmit(onValidSubmit)}>
				<CardContent className="flex flex-col gap-6">
					{formError ? (
						<Alert variant="destructive">
							<AlertTitle>
								{isCreate ? "Create failed" : "Save failed"}
							</AlertTitle>
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
						{isCreate ? "Create warehouse" : "Save changes"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
