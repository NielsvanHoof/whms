"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { usePermissions } from "@/hooks/use-permissions";
import { deleteLocation, type LocationsIndexQuery } from "@/lib/api/locations";
import { canManageLocations, canViewLocations } from "@/lib/permissions";
import {
	locationQueryKeys,
	locationsListQueryOptions,
} from "@/lib/queries/locations";

const sortOptions = [
	{ value: "__default__", label: "Newest first" },
	{ value: "code", label: "Code A-Z" },
	{ value: "-code", label: "Code Z-A" },
	{ value: "type", label: "Type A-Z" },
	{ value: "-type", label: "Type Z-A" },
] as const;
const locationSortValues = ["code", "-code", "type", "-type"] as const;
type LocationSort = (typeof locationSortValues)[number];

function isLocationSort(value: string): value is LocationSort {
	return locationSortValues.includes(value as LocationSort);
}

export default function LocationsPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const searchParams = useSearchParams();
	const permissions = usePermissions();
	const [deletingId, setDeletingId] = useState<number | null>(null);

	const codeFilter = searchParams.get("filter[code]") ?? "";
	const typeFilter = searchParams.get("filter[type]") ?? "";
	const warehouseFilter = searchParams.get("filter[warehouse_id]") ?? "";
	const sort = searchParams.get("sort") ?? "";
	const [codeFilterValue, setCodeFilterValue] = useState(codeFilter);
	const [typeFilterValue, setTypeFilterValue] = useState(typeFilter);
	const [warehouseFilterValue, setWarehouseFilterValue] =
		useState(warehouseFilter);
	const [sortValue, setSortValue] = useState(sort || "__default__");
	const permList = permissions.permissions;
	const canView = canViewLocations(permList);
	const canCreate = canManageLocations(permList);
	const canEdit = canManageLocations(permList);
	const canDelete = canManageLocations(permList);

	useEffect(() => {
		setCodeFilterValue(codeFilter);
		setTypeFilterValue(typeFilter);
		setWarehouseFilterValue(warehouseFilter);
		setSortValue(sort || "__default__");
	}, [codeFilter, sort, typeFilter, warehouseFilter]);

	const query = useMemo<LocationsIndexQuery>(() => {
		const validSort = isLocationSort(sort) ? sort : "";
		return {
			...(codeFilter ? { "filter[code]": codeFilter } : {}),
			...(typeFilter ? { "filter[type]": typeFilter } : {}),
			...(warehouseFilter ? { "filter[warehouse_id]": warehouseFilter } : {}),
			...(validSort ? { sort: [validSort] } : {}),
		};
	}, [codeFilter, sort, typeFilter, warehouseFilter]);

	const listQuery = useQuery({
		...locationsListQueryOptions(query),
		placeholderData: (previousData) => previousData,
	});
	const deleteMutation = useMutation({
		mutationFn: deleteLocation,
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex items-end justify-between gap-3">
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-2xl tracking-tight">Locations</h1>
					<p className="text-muted-foreground text-sm">
						Manage storage locations.
					</p>
				</div>
				{canCreate ? (
					<Button asChild variant="outline">
						<Link href="/locations/create">
							<PlusIcon data-icon="inline-start" />
							Create location
						</Link>
					</Button>
				) : null}
			</div>
			{!canView ? (
				<ErrorState
					description="You do not have permission to view locations."
					title="Access denied"
				/>
			) : null}

			{canView ? (
				<Card>
					<CardHeader>
						<CardTitle>Filters</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							className="flex flex-col gap-3 md:flex-row md:items-end"
							onSubmit={(event) => {
								event.preventDefault();
								const next = new URLSearchParams();
								if (codeFilterValue.trim())
									next.set("filter[code]", codeFilterValue.trim());
								if (typeFilterValue.trim())
									next.set("filter[type]", typeFilterValue.trim());
								if (warehouseFilterValue.trim())
									next.set("filter[warehouse_id]", warehouseFilterValue.trim());
								if (sortValue !== "__default__") next.set("sort", sortValue);
								router.push(
									`/locations${next.toString() ? `?${next.toString()}` : ""}`,
								);
							}}
						>
							<Input
								onChange={(event) => setCodeFilterValue(event.target.value)}
								placeholder="Code"
								value={codeFilterValue}
							/>
							<Input
								onChange={(event) => setTypeFilterValue(event.target.value)}
								placeholder="Type"
								value={typeFilterValue}
							/>
							<Input
								onChange={(event) =>
									setWarehouseFilterValue(event.target.value)
								}
								placeholder="Warehouse ID"
								value={warehouseFilterValue}
							/>
							<Select onValueChange={setSortValue} value={sortValue}>
								<SelectTrigger className="w-full md:w-56">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{sortOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button type="submit">
								<SearchIcon data-icon="inline-start" />
								Apply
							</Button>
						</form>
					</CardContent>
				</Card>
			) : null}

			{canView ? (
				<Card>
					<CardContent className="pt-6">
						{listQuery.isPending && !listQuery.data ? (
							<LoadingState title="Loading locations" />
						) : null}
						{listQuery.isError ? (
							<ErrorState
								error={listQuery.error}
								title="Could not load locations"
							/>
						) : null}
						{listQuery.data ? (
							<div className="relative flex flex-col gap-3">
								{listQuery.isFetching && !listQuery.isPending ? (
									<div className="absolute inset-x-0 top-0 flex justify-center">
										<div className="rounded-md border bg-background/95 px-3 py-1 text-xs text-muted-foreground">
											Refreshing table...
										</div>
									</div>
								) : null}
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>ID</TableHead>
											<TableHead>Warehouse</TableHead>
											<TableHead>Code</TableHead>
											<TableHead>Type</TableHead>
											{canEdit || canDelete ? (
												<TableHead className="text-right">Actions</TableHead>
											) : null}
										</TableRow>
									</TableHeader>
									<TableBody>
										{listQuery.data.data.map((location) => (
											<TableRow key={location.id}>
												<TableCell>{location.id}</TableCell>
												<TableCell>
													{location.warehouse_code || location.warehouse_id}
												</TableCell>
												<TableCell>{location.code}</TableCell>
												<TableCell>{location.type}</TableCell>
												{canEdit || canDelete ? (
													<TableCell className="text-right">
														<div className="flex justify-end gap-2">
															{canEdit ? (
																<Button asChild size="sm" variant="outline">
																	<Link href={`/locations/${location.id}/edit`}>
																		<PencilIcon data-icon="inline-start" />
																		Edit
																	</Link>
																</Button>
															) : null}
															{canDelete ? (
																<Button
																	disabled={
																		deleteMutation.isPending &&
																		deletingId === location.id
																	}
																	onClick={async () => {
																		if (
																			!window.confirm(
																				`Delete location ${location.code}?`,
																			)
																		)
																			return;
																		setDeletingId(location.id);
																		await deleteMutation.mutateAsync(
																			location.id,
																		);
																		await queryClient.invalidateQueries({
																			queryKey: locationQueryKeys.all,
																		});
																		setDeletingId(null);
																	}}
																	size="sm"
																	type="button"
																	variant="outline"
																>
																	{deleteMutation.isPending &&
																	deletingId === location.id ? (
																		<Spinner
																			aria-hidden
																			data-icon="inline-start"
																		/>
																	) : (
																		<Trash2Icon data-icon="inline-start" />
																	)}
																	Delete
																</Button>
															) : null}
														</div>
													</TableCell>
												) : null}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						) : null}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
