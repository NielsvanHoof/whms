"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, MapPinIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { TableEmptyState } from "@/components/query/table-empty-state";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { usePermissions } from "@/hooks/use-permissions";
import {
	canManageLocations,
	canViewInventory,
	canViewLocations,
} from "@/lib/permissions";
import { inventoryBalancesListQueryOptions } from "@/lib/queries/inventory";
import { locationDetailQueryOptions } from "@/lib/queries/locations";
import { formatDate } from "@/lib/utils";

export default function LocationDetailPage() {
	const { permissions: permissionList } = usePermissions();
	const params = useParams();
	const rawId = params.locationId;
	const locationId =
		typeof rawId === "string" ? Number.parseInt(rawId, 10) : Number.NaN;
	const idIsValid = Number.isFinite(locationId);

	const canView = canViewLocations(permissionList);
	const canEdit = canManageLocations(permissionList);
	const canViewStock = canViewInventory(permissionList);

	const detailQuery = useQuery({
		...locationDetailQueryOptions(idIsValid ? locationId : 0),
		enabled: idIsValid && canView,
	});

	const balancesQuery = useQuery({
		...inventoryBalancesListQueryOptions({
			"filter[location_id]": String(locationId),
			per_page: 25,
			page: 1,
		}),
		enabled: idIsValid && canView && canViewStock,
	});

	if (!canView) {
		return (
			<div className="flex flex-col gap-6 p-6">
				<ErrorState
					description="You do not have permission to view locations."
					title="Access denied"
				/>
			</div>
		);
	}

	if (!idIsValid) {
		return (
			<div className="flex flex-col gap-4 p-6">
				<ErrorState
					description="The location ID in the URL is not valid."
					title="Invalid location"
				/>
				<Button asChild variant="outline">
					<Link href="/locations">Back to locations</Link>
				</Button>
			</div>
		);
	}

	const location = detailQuery.data?.data;

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-wrap items-center gap-2">
				<Button asChild size="sm" variant="outline">
					<Link href="/locations">
						<ArrowLeftIcon data-icon="inline-start" />
						Locations
					</Link>
				</Button>
				{canEdit && location ? (
					<Button asChild size="sm">
						<Link href={`/locations/${location.id}/edit`}>
							<PencilIcon data-icon="inline-start" />
							Edit
						</Link>
					</Button>
				) : null}
			</div>

			{detailQuery.isPending ? <LoadingState title="Loading location" /> : null}
			{detailQuery.isError ? (
				<ErrorState
					description="This location may not exist or you may not have access."
					error={detailQuery.error}
					title="Could not load location"
				/>
			) : null}

			{location ? (
				<>
					<Card>
						<CardHeader>
							<CardTitle>{location.code}</CardTitle>
							<CardDescription>
								Storage location in warehouse{" "}
								{location.warehouse_code ?? location.warehouse_id}.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<dl className="grid gap-4 sm:grid-cols-2">
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										ID
									</dt>
									<dd className="text-sm">{location.id}</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Type
									</dt>
									<dd className="text-sm">{location.type}</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Warehouse
									</dt>
									<dd className="text-sm">
										<Link
											className="font-medium hover:underline"
											href={`/warehouses/${location.warehouse_id}`}
										>
											{location.warehouse_code ?? location.warehouse_id}
										</Link>
									</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Created
									</dt>
									<dd className="text-sm">{formatDate(location.created_at)}</dd>
								</div>
							</dl>
						</CardContent>
					</Card>

					{canViewStock ? (
						<Card>
							<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
								<div className="flex flex-col gap-1.5">
									<CardTitle>Stock balances</CardTitle>
									<CardDescription>
										On-hand quantities for products at this location.
									</CardDescription>
								</div>
								<Button asChild size="sm" variant="outline">
									<Link
										href={`/inventory/balances?filter[location_id]=${location.id}`}
									>
										View all balances
									</Link>
								</Button>
							</CardHeader>
							<CardContent>
								{balancesQuery.isPending ? (
									<LoadingState title="Loading balances" />
								) : null}
								{balancesQuery.isError ? (
									<ErrorState
										error={balancesQuery.error}
										title="Could not load balances"
									/>
								) : null}
								{balancesQuery.data ? (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Product</TableHead>
												<TableHead>SKU</TableHead>
												<TableHead className="text-right">Quantity</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{balancesQuery.data.data.length ? (
												balancesQuery.data.data.map((balance) => (
													<TableRow key={balance.id}>
														<TableCell className="font-medium">
															<Link
																className="hover:underline"
																href={`/inventory/balances/${balance.id}`}
															>
																{balance.product?.name ?? balance.product_id}
															</Link>
														</TableCell>
														<TableCell>{balance.product?.sku ?? "-"}</TableCell>
														<TableCell className="text-right tabular-nums">
															{balance.quantity}
														</TableCell>
													</TableRow>
												))
											) : (
												<TableEmptyState
													colSpan={3}
													description="No stock recorded at this location yet."
													icon={MapPinIcon}
													title="No balances"
												/>
											)}
										</TableBody>
									</Table>
								) : null}
							</CardContent>
						</Card>
					) : null}
				</>
			) : null}
		</div>
	);
}
