"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import {
	type ReorderPointFormSubmitContext,
	submitReorderPointForm,
} from "@/components/reorder-points/reorder-point-form-submit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
	Field,
	FieldDescription,
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
	createReorderPoint,
	type UpdateReorderPointRequestBody,
	updateReorderPoint,
} from "@/lib/api/reorder-points";
import { locationsListQueryOptions } from "@/lib/queries/locations";
import { productsListQueryOptions } from "@/lib/queries/products";
import {
	type ReorderPointFormValues,
	reorderPointFormSchema,
} from "@/lib/schemas/reorder-point-form";

type ReorderPointFormProps = {
	mode: "create" | "edit";
	reorderPointId?: number;
	defaultValues?: Partial<ReorderPointFormValues>;
	/** Shown instead of the product/location selects when editing (they cannot change). */
	productLabel?: string;
	locationLabel?: string;
};

export function ReorderPointForm({
	mode,
	reorderPointId,
	defaultValues,
	productLabel,
	locationLabel,
}: ReorderPointFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [formError, setFormError] = useState<string | null>(null);

	const productsQuery = useQuery(
		productsListQueryOptions({ sort: ["name"], "filter[is_active]": "1" }),
	);
	const locationsQuery = useQuery(
		locationsListQueryOptions({ sort: ["code"] }),
	);

	const form = useForm<ReorderPointFormValues>({
		resolver: zodResolver(reorderPointFormSchema),
		defaultValues: {
			productId: defaultValues?.productId ?? 0,
			locationId: defaultValues?.locationId ?? 0,
			quantity: defaultValues?.quantity ?? 0,
		},
	});

	const createMutation = useMutation({
		mutationFn: createReorderPoint,
	});
	const updateMutation = useMutation({
		mutationFn: (
			body: Omit<UpdateReorderPointRequestBody, "reorder_point_id">,
		) => {
			if (!reorderPointId) {
				throw new Error("Missing reorder point id");
			}
			return updateReorderPoint(reorderPointId, body);
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

	const selectedProductId = watch("productId");
	const selectedLocationId = watch("locationId");

	const submitCtx = useMemo<ReorderPointFormSubmitContext>(
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
		(values: ReorderPointFormValues) =>
			submitReorderPointForm(values, submitCtx),
		[submitCtx],
	);

	if (mode === "create") {
		if (productsQuery.isPending || locationsQuery.isPending) {
			return <LoadingState title="Loading products and locations" />;
		}

		if (productsQuery.isError || locationsQuery.isError) {
			return (
				<ErrorState
					description="A product and a location are required before creating a reorder point."
					error={productsQuery.error ?? locationsQuery.error}
					title="Could not load products or locations"
				/>
			);
		}
	}

	const products = productsQuery.data?.data ?? [];
	const locations = locationsQuery.data?.data ?? [];

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
						{mode === "create" ? (
							<>
								<Field data-invalid={errors.productId ? "true" : undefined}>
									<FieldLabel htmlFor="reorder-point-product">
										Product
									</FieldLabel>
									<Select
										onValueChange={(value) => {
											setValue("productId", Number.parseInt(value, 10), {
												shouldValidate: true,
											});
										}}
										value={selectedProductId ? String(selectedProductId) : ""}
									>
										<SelectTrigger id="reorder-point-product">
											<SelectValue placeholder="Choose a product" />
										</SelectTrigger>
										<SelectContent>
											{products.map((product) => (
												<SelectItem key={product.id} value={String(product.id)}>
													{product.sku} — {product.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldError>{errors.productId?.message}</FieldError>
								</Field>

								<Field data-invalid={errors.locationId ? "true" : undefined}>
									<FieldLabel htmlFor="reorder-point-location">
										Location
									</FieldLabel>
									<Select
										onValueChange={(value) => {
											setValue("locationId", Number.parseInt(value, 10), {
												shouldValidate: true,
											});
										}}
										value={selectedLocationId ? String(selectedLocationId) : ""}
									>
										<SelectTrigger id="reorder-point-location">
											<SelectValue placeholder="Choose a location" />
										</SelectTrigger>
										<SelectContent>
											{locations.map((location) => (
												<SelectItem
													key={location.id}
													value={String(location.id)}
												>
													{location.code}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldDescription>
										Thresholds are per product and location, so different
										warehouses can carry different targets.
									</FieldDescription>
									<FieldError>{errors.locationId?.message}</FieldError>
								</Field>
							</>
						) : (
							<div className="flex flex-col gap-3 text-sm">
								<div>
									<span className="text-muted-foreground">Product</span>
									<p className="font-medium">{productLabel}</p>
								</div>
								<div>
									<span className="text-muted-foreground">Location</span>
									<p className="font-medium">{locationLabel}</p>
								</div>
							</div>
						)}

						<Field data-invalid={errors.quantity ? "true" : undefined}>
							<FieldLabel htmlFor="reorder-point-quantity">
								Reorder threshold
							</FieldLabel>
							<Input
								id="reorder-point-quantity"
								inputMode="numeric"
								{...register("quantity", { valueAsNumber: true })}
							/>
							<FieldDescription>
								An alert appears when on-hand quantity drops to or below this
								number.
							</FieldDescription>
							<FieldError>{errors.quantity?.message}</FieldError>
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex gap-2 border-t border-border/60 pt-6">
					<Button asChild type="button" variant="outline">
						<Link href="/inventory/reorder-points">Cancel</Link>
					</Button>
					<Button disabled={isSubmitting} type="submit">
						{isSubmitting ? (
							<Spinner aria-hidden data-icon="inline-start" />
						) : null}
						{mode === "create" ? "Create reorder point" : "Save changes"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
