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
	canManageWarehouses,
	canViewLocations,
	canViewWarehouses,
} from "@/lib/permissions";
import { locationsListQueryOptions } from "@/lib/queries/locations";
import { warehouseDetailQueryOptions } from "@/lib/queries/warehouses";
import { formatDate } from "@/lib/utils";

export default function WarehouseDetailPage() {
	const { permissions: permissionList } = usePermissions();
	const params = useParams();
	const rawId = params.warehouseId;
	const warehouseId =
		typeof rawId === "string" ? Number.parseInt(rawId, 10) : Number.NaN;
	const idIsValid = Number.isFinite(warehouseId);

	const canView = canViewWarehouses(permissionList);
	const canEdit = canManageWarehouses(permissionList);
	const canViewLocationList = canViewLocations(permissionList);

	const detailQuery = useQuery({
		...warehouseDetailQueryOptions(idIsValid ? warehouseId : 0),
		enabled: idIsValid && canView,
	});

	const locationsQuery = useQuery({
		...locationsListQueryOptions({
			"filter[warehouse_id]": String(warehouseId),
			per_page: 25,
			page: 1,
			sort: ["code"],
		}),
		enabled: idIsValid && canView && canViewLocationList,
	});

	if (!canView) {
		return (
			<div className="flex flex-col gap-6 p-6">
				<ErrorState
					description="You do not have permission to view warehouses."
					title="Access denied"
				/>
			</div>
		);
	}

	if (!idIsValid) {
		return (
			<div className="flex flex-col gap-4 p-6">
				<ErrorState
					description="The warehouse ID in the URL is not valid."
					title="Invalid warehouse"
				/>
				<Button asChild variant="outline">
					<Link href="/warehouses">Back to warehouses</Link>
				</Button>
			</div>
		);
	}

	const warehouse = detailQuery.data?.data;

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-wrap items-center gap-2">
				<Button asChild size="sm" variant="outline">
					<Link href="/warehouses">
						<ArrowLeftIcon data-icon="inline-start" />
						Warehouses
					</Link>
				</Button>
				{canEdit && warehouse ? (
					<Button asChild size="sm">
						<Link href={`/warehouses/${warehouse.id}/edit`}>
							<PencilIcon data-icon="inline-start" />
							Edit
						</Link>
					</Button>
				) : null}
			</div>

			{detailQuery.isPending ? (
				<LoadingState title="Loading warehouse" />
			) : null}
			{detailQuery.isError ? (
				<ErrorState
					description="This warehouse may not exist or you may not have access."
					error={detailQuery.error}
					title="Could not load warehouse"
				/>
			) : null}

			{warehouse ? (
				<>
					<Card>
						<CardHeader>
							<CardTitle>{warehouse.name}</CardTitle>
							<CardDescription>
								{warehouse.code ? `Code ${warehouse.code}` : "No code assigned"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<dl className="grid gap-4 sm:grid-cols-2">
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										ID
									</dt>
									<dd className="text-sm">{warehouse.id}</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Code
									</dt>
									<dd className="text-sm">{warehouse.code ?? "-"}</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Created
									</dt>
									<dd className="text-sm">
										{formatDate(warehouse.created_at)}
									</dd>
								</div>
								<div className="flex flex-col gap-1">
									<dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
										Updated
									</dt>
									<dd className="text-sm">
										{formatDate(warehouse.updated_at)}
									</dd>
								</div>
							</dl>
						</CardContent>
					</Card>

					{canViewLocationList ? (
						<Card>
							<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
								<div className="flex flex-col gap-1.5">
									<CardTitle>Locations</CardTitle>
									<CardDescription>
										Storage locations in this warehouse.
									</CardDescription>
								</div>
								<Button asChild size="sm" variant="outline">
									<Link
										href={`/locations?filter[warehouse_id]=${warehouse.id}`}
									>
										View all locations
									</Link>
								</Button>
							</CardHeader>
							<CardContent>
								{locationsQuery.isPending ? (
									<LoadingState title="Loading locations" />
								) : null}
								{locationsQuery.isError ? (
									<ErrorState
										error={locationsQuery.error}
										title="Could not load locations"
									/>
								) : null}
								{locationsQuery.data ? (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Code</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Created</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{locationsQuery.data.data.length ? (
												locationsQuery.data.data.map((location) => (
													<TableRow key={location.id}>
														<TableCell className="font-medium">
															<Link
																className="hover:underline"
																href={`/locations/${location.id}`}
															>
																{location.code}
															</Link>
														</TableCell>
														<TableCell>{location.type}</TableCell>
														<TableCell>
															{formatDate(location.created_at)}
														</TableCell>
													</TableRow>
												))
											) : (
												<TableEmptyState
													colSpan={3}
													description="No locations have been created in this warehouse yet."
													icon={MapPinIcon}
													title="No locations"
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
