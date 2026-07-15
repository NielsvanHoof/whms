"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
	type LocationFormSubmitContext,
	submitLocationForm,
} from "@/components/locations/location-form-submit";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
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
	createLocation,
	type UpdateLocationRequestBody,
	updateLocation,
} from "@/lib/api/locations";
import { warehousesListQueryOptions } from "@/lib/queries/warehouses";
import {
	type LocationFormValues,
	locationFormSchema,
} from "@/lib/schemas/location-form";

type LocationFormProps = {
	mode: "create" | "edit";
	locationId?: number;
	defaultValues?: Partial<LocationFormValues>;
};

export function LocationForm({
	mode,
	locationId,
	defaultValues,
}: LocationFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [formError, setFormError] = useState<string | null>(null);

	const warehousesQuery = useQuery(
		warehousesListQueryOptions({ sort: ["name"] }),
	);
	const form = useForm<LocationFormValues>({
		resolver: zodResolver(locationFormSchema),
		defaultValues: {
			warehouseId: defaultValues?.warehouseId ?? 0,
			code: defaultValues?.code ?? "",
			type: defaultValues?.type ?? "",
		},
	});

	const createMutation = useMutation({
		mutationFn: createLocation,
	});
	const updateMutation = useMutation({
		mutationFn: (body: Omit<UpdateLocationRequestBody, "location_id">) => {
			if (!locationId) {
				throw new Error("Missing location id");
			}
			return updateLocation(locationId, body);
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

	const selectedWarehouseId = watch("warehouseId");

	const submitCtx = useMemo<LocationFormSubmitContext>(
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
		(values: LocationFormValues) => submitLocationForm(values, submitCtx),
		[submitCtx],
	);

	if (warehousesQuery.isPending) {
		return <LoadingState title="Loading warehouses" />;
	}

	if (warehousesQuery.isError) {
		return (
			<ErrorState
				description="A warehouse is required before creating a location."
				error={warehousesQuery.error}
				title="Could not load warehouses"
			/>
		);
	}

	const warehouses = warehousesQuery.data.data;

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
						<Field data-invalid={errors.warehouseId ? "true" : undefined}>
							<FieldLabel htmlFor="location-warehouse">Warehouse</FieldLabel>
							<Select
								onValueChange={(value) => {
									setValue("warehouseId", Number.parseInt(value, 10), {
										shouldValidate: true,
									});
								}}
								value={selectedWarehouseId ? String(selectedWarehouseId) : ""}
							>
								<SelectTrigger id="location-warehouse">
									<SelectValue placeholder="Choose a warehouse" />
								</SelectTrigger>
								<SelectContent>
									{warehouses.map((warehouse) => (
										<SelectItem key={warehouse.id} value={String(warehouse.id)}>
											{warehouse.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldDescription>
								Locations are always scoped to one warehouse.
							</FieldDescription>
							<FieldError>{errors.warehouseId?.message}</FieldError>
						</Field>

						<Field data-invalid={errors.code ? "true" : undefined}>
							<FieldLabel htmlFor="location-code">Code</FieldLabel>
							<Input
								id="location-code"
								placeholder="A-01-01"
								{...register("code")}
							/>
							<FieldError>{errors.code?.message}</FieldError>
						</Field>

						<Field data-invalid={errors.type ? "true" : undefined}>
							<FieldLabel htmlFor="location-type">Type</FieldLabel>
							<Input
								id="location-type"
								placeholder="rack"
								{...register("type")}
							/>
							<FieldError>{errors.type?.message}</FieldError>
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex gap-2 border-t border-border/60 pt-6">
					<Button asChild type="button" variant="outline">
						<Link href="/locations">Cancel</Link>
					</Button>
					<Button disabled={isSubmitting} type="submit">
						{isSubmitting ? (
							<Spinner aria-hidden data-icon="inline-start" />
						) : null}
						{mode === "create" ? "Create location" : "Save changes"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
