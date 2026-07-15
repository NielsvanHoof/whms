"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
	createInventoryMovement,
	type InventoryMovementKind,
} from "@/lib/api/inventory";
import { inventoryQueryKeys } from "@/lib/queries/inventory";
import { locationsListQueryOptions } from "@/lib/queries/locations";
import { productsListQueryOptions } from "@/lib/queries/products";
import { toastApiError, toastSuccess } from "@/lib/toast";

export type RecordMovementPrefill = {
	kind?: InventoryMovementKind;
	locationId?: string;
	productId?: string;
};

type RecordMovementFormProps = {
	/** When false, the card is not rendered (caller already checked `inventory.manage`). */
	enabled: boolean;
	/** Applied once when the form mounts (e.g. from balance detail deep link). */
	prefill?: RecordMovementPrefill;
	onPrefillApplied?: () => void;
};

/**
 * Posts to `/v1/inventory-movements` with the shape expected for each `kind`.
 * Receipt and adjustment use one location; transfer uses from/to locations.
 */
export function RecordMovementForm({
	enabled,
	prefill,
	onPrefillApplied,
}: RecordMovementFormProps) {
	const queryClient = useQueryClient();
	const locationsQuery = useQuery(locationsListQueryOptions());
	const productsQuery = useQuery(productsListQueryOptions());
	const prefillAppliedRef = useRef(false);

	const [kind, setKind] = useState<InventoryMovementKind>("receipt");
	const [locationId, setLocationId] = useState<string>("");
	const [fromLocationId, setFromLocationId] = useState<string>("");
	const [toLocationId, setToLocationId] = useState<string>("");
	const [productId, setProductId] = useState<string>("");
	const [quantity, setQuantity] = useState<string>("");
	const [formError, setFormError] = useState<string | null>(null);

	useEffect(() => {
		if (!prefill || prefillAppliedRef.current) {
			return;
		}
		prefillAppliedRef.current = true;
		if (
			prefill.kind === "receipt" ||
			prefill.kind === "adjustment" ||
			prefill.kind === "transfer"
		) {
			setKind(prefill.kind);
		}
		if (prefill.locationId) {
			setLocationId(prefill.locationId);
		}
		if (prefill.productId) {
			setProductId(prefill.productId);
		}
		onPrefillApplied?.();
	}, [prefill, onPrefillApplied]);

	const mutation = useMutation({
		mutationFn: createInventoryMovement,
		onSuccess: async () => {
			setFormError(null);
			setQuantity("");
			await queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
			toastSuccess("Movement recorded");
		},
		onError: (error: unknown) => {
			void toastApiError(error, "Could not record movement.");
			setFormError("Could not record movement. See toast for details.");
		},
	});

	if (!enabled) {
		return null;
	}

	const locations = locationsQuery.data?.data ?? [];
	const products = productsQuery.data?.data ?? [];

	const onSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		setFormError(null);

		const product_id = Number.parseInt(productId, 10);
		if (!Number.isFinite(product_id)) {
			setFormError("Pick a product.");
			return;
		}

		if (kind === "receipt" || kind === "adjustment") {
			const location_id = Number.parseInt(locationId, 10);
			if (!Number.isFinite(location_id)) {
				setFormError("Pick a location.");
				return;
			}
			const qty = Number.parseInt(quantity, 10);
			if (!Number.isFinite(qty)) {
				setFormError("Enter a whole-number quantity.");
				return;
			}
			if (kind === "receipt") {
				mutation.mutate({
					kind: "receipt",
					location_id,
					product_id,
					quantity: qty,
				});
			} else {
				mutation.mutate({
					kind: "adjustment",
					location_id,
					product_id,
					quantity: qty,
				});
			}
			return;
		}

		const from_location_id = Number.parseInt(fromLocationId, 10);
		const to_location_id = Number.parseInt(toLocationId, 10);
		if (
			!Number.isFinite(from_location_id) ||
			!Number.isFinite(to_location_id)
		) {
			setFormError("Pick both source and destination locations.");
			return;
		}
		const qty = Number.parseInt(quantity, 10);
		if (!Number.isFinite(qty) || qty < 1) {
			setFormError("Enter a positive whole-number quantity.");
			return;
		}
		mutation.mutate({
			kind: "transfer",
			from_location_id,
			to_location_id,
			product_id,
			quantity: qty,
		});
	};

	const selectorsLoading = locationsQuery.isPending || productsQuery.isPending;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Record movement</CardTitle>
				<CardDescription>
					Receipts add stock, adjustments apply a signed delta, transfers move
					stock between two locations in the same warehouse.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="flex flex-col gap-4" onSubmit={onSubmit}>
					<div className="flex flex-col gap-2">
						<Label htmlFor="movement-kind">Kind</Label>
						<Select
							onValueChange={(value) => {
								setKind(value as InventoryMovementKind);
							}}
							value={kind}
						>
							<SelectTrigger id="movement-kind">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="receipt">Receipt</SelectItem>
								<SelectItem value="adjustment">Adjustment</SelectItem>
								<SelectItem value="transfer">Transfer</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{kind === "transfer" ? (
						<div className="grid gap-4 md:grid-cols-2">
							<div className="flex flex-col gap-2">
								<Label htmlFor="from-location">From location</Label>
								<Select
									onValueChange={setFromLocationId}
									value={fromLocationId}
								>
									<SelectTrigger id="from-location">
										<SelectValue placeholder="Select location" />
									</SelectTrigger>
									<SelectContent>
										{locations.map((loc) => (
											<SelectItem key={loc.id} value={String(loc.id)}>
												{loc.code} (WH {loc.warehouse_id})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="to-location">To location</Label>
								<Select onValueChange={setToLocationId} value={toLocationId}>
									<SelectTrigger id="to-location">
										<SelectValue placeholder="Select location" />
									</SelectTrigger>
									<SelectContent>
										{locations.map((loc) => (
											<SelectItem key={loc.id} value={String(loc.id)}>
												{loc.code} (WH {loc.warehouse_id})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					) : (
						<div className="flex flex-col gap-2">
							<Label htmlFor="location">Location</Label>
							<Select onValueChange={setLocationId} value={locationId}>
								<SelectTrigger id="location">
									<SelectValue placeholder="Select location" />
								</SelectTrigger>
								<SelectContent>
									{locations.map((loc) => (
										<SelectItem key={loc.id} value={String(loc.id)}>
											{loc.code} (WH {loc.warehouse_id})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					<div className="flex flex-col gap-2">
						<Label htmlFor="product">Product</Label>
						<Select onValueChange={setProductId} value={productId}>
							<SelectTrigger id="product">
								<SelectValue placeholder="Select product" />
							</SelectTrigger>
							<SelectContent>
								{products.map((p) => (
									<SelectItem key={p.id} value={String(p.id)}>
										{p.sku} — {p.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="quantity">Quantity</Label>
						<Input
							id="quantity"
							inputMode="numeric"
							onChange={(event) => setQuantity(event.target.value)}
							placeholder={
								kind === "adjustment"
									? "Positive or negative integer"
									: "Positive integer"
							}
							value={quantity}
						/>
					</div>

					{formError ? (
						<p className="text-destructive text-sm" role="alert">
							{formError}
						</p>
					) : null}

					<Button
						disabled={mutation.isPending || selectorsLoading}
						type="submit"
					>
						{mutation.isPending ? (
							<Spinner
								aria-hidden
								className="size-4"
								data-icon="inline-start"
							/>
						) : null}
						Submit movement
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
