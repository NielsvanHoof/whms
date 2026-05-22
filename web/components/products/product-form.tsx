"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
	type ProductFormSubmitContext,
	submitProductForm,
} from "@/components/products/product-form-submit";
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
import {
	createProduct,
	type UpdateProductRequestBody,
	updateProduct,
} from "@/lib/api/products";
import {
	type ProductFormValues,
	productFormSchema,
} from "@/lib/schemas/product-form";

type ProductFormProps = {
	mode: "create" | "edit";
	productId?: number;
	defaultValues?: Partial<ProductFormValues>;
};

export function ProductForm({
	mode,
	productId,
	defaultValues,
}: ProductFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<ProductFormValues>({
		resolver: zodResolver(productFormSchema),
		defaultValues: {
			sku: defaultValues?.sku ?? "",
			name: defaultValues?.name ?? "",
			unit: defaultValues?.unit ?? "",
			isActive: defaultValues?.isActive ?? true,
		},
	});

	const createMutation = useMutation({
		mutationFn: createProduct,
	});
	const updateMutation = useMutation({
		mutationFn: (body: Omit<UpdateProductRequestBody, "product_id">) => {
			if (!productId) {
				throw new Error("Missing product id");
			}
			return updateProduct(productId, body);
		},
	});

	const {
		register,
		handleSubmit,
		setError,
		setValue,
		formState: { errors, isSubmitting },
		watch,
	} = form;
	const isActiveValue = watch("isActive");

	const submitCtx = useMemo<ProductFormSubmitContext>(
		() => ({
			mode,
			router,
			queryClient,
			createMutation,
			updateMutation,
			setFormError,
			setError,
		}),
		[mode, router, queryClient, createMutation, updateMutation, setError],
	);

	const onValidSubmit = useCallback(
		(values: ProductFormValues) => submitProductForm(values, submitCtx),
		[submitCtx],
	);

	return (
		<Card className="max-w-xl">
			<form noValidate onSubmit={handleSubmit(onValidSubmit)}>
				<CardContent className="flex flex-col gap-5">
					{formError ? (
						<Alert variant="destructive">
							<AlertTitle>Save failed</AlertTitle>
							<AlertDescription>{formError}</AlertDescription>
						</Alert>
					) : null}
					<FieldGroup className="gap-4">
						<Field data-invalid={errors.sku ? "true" : undefined}>
							<FieldLabel htmlFor="product-sku">SKU</FieldLabel>
							<Input
								id="product-sku"
								placeholder="SKU-0001"
								{...register("sku")}
							/>
							<FieldError>{errors.sku?.message}</FieldError>
						</Field>
						<Field data-invalid={errors.name ? "true" : undefined}>
							<FieldLabel htmlFor="product-name">Name</FieldLabel>
							<Input
								id="product-name"
								placeholder="Product name"
								{...register("name")}
							/>
							<FieldError>{errors.name?.message}</FieldError>
						</Field>
						<Field data-invalid={errors.unit ? "true" : undefined}>
							<FieldLabel htmlFor="product-unit">Unit</FieldLabel>
							<Input
								id="product-unit"
								placeholder="pcs"
								{...register("unit")}
							/>
							<FieldError>{errors.unit?.message}</FieldError>
						</Field>
						<Field data-invalid={errors.isActive ? "true" : undefined}>
							<FieldLabel htmlFor="product-active">Status</FieldLabel>
							<Select
								onValueChange={(value) => {
									setValue("isActive", value === "true", {
										shouldValidate: true,
									});
								}}
								value={String(isActiveValue)}
							>
								<SelectTrigger id="product-active">
									<SelectValue placeholder="Choose status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="true">Active</SelectItem>
									<SelectItem value="false">Inactive</SelectItem>
								</SelectContent>
							</Select>
							<FieldError>{errors.isActive?.message}</FieldError>
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex gap-2 border-t border-border/60 pt-6">
					<Button asChild type="button" variant="outline">
						<Link href="/products">Cancel</Link>
					</Button>
					<Button disabled={isSubmitting} type="submit">
						{isSubmitting ? (
							<Spinner aria-hidden data-icon="inline-start" />
						) : null}
						{mode === "create" ? "Create product" : "Save changes"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
