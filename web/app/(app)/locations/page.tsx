"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { DeleteConfirmDialog } from "@/components/confirm/delete-confirm-dialog";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { usePermissions } from "@/hooks/use-permissions";
import { deleteLocation } from "@/lib/api/locations";
import { useLocationFilters } from "@/lib/nuqs/location-filters";
import { canManageLocations, canViewLocations } from "@/lib/permissions";
import {
	locationQueryKeys,
	locationsListQueryOptions,
} from "@/lib/queries/locations";
import { toastApiError, toastSuccess } from "@/lib/toast";

const sortOptions = [
	{ value: "__default__", label: "Newest first" },
	{ value: "code", label: "Code A-Z" },
	{ value: "-code", label: "Code Z-A" },
	{ value: "type", label: "Type A-Z" },
	{ value: "-type", label: "Type Z-A" },
] as const;

export default function LocationsPage() {
	const queryClient = useQueryClient();
	const permissions = usePermissions();
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const { apiQuery, applyFilters, draft, resetFilters, setDraft } =
		useLocationFilters();
	const permList = permissions.permissions;
	const canView = canViewLocations(permList);
	const canCreate = canManageLocations(permList);
	const canEdit = canManageLocations(permList);
	const canDelete = canManageLocations(permList);

	const listQuery = useQuery({
		...locationsListQueryOptions(apiQuery),
		placeholderData: (previousData) => previousData,
	});
	const deleteMutation = useMutation({
		mutationFn: deleteLocation,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: locationQueryKeys.all });
			toastSuccess("Location deleted");
		},
		onError: (error) => {
			void toastApiError(error, "Could not delete location.");
		},
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
								applyFilters();
							}}
						>
							<Input
								onChange={(event) => {
									setDraft((current) => ({
										...current,
										code: event.target.value,
									}));
								}}
								placeholder="Code"
								value={draft.code}
							/>
							<Input
								onChange={(event) => {
									setDraft((current) => ({
										...current,
										type: event.target.value,
									}));
								}}
								placeholder="Type"
								value={draft.type}
							/>
							<Input
								onChange={(event) => {
									setDraft((current) => ({
										...current,
										warehouseId: event.target.value,
									}));
								}}
								placeholder="Warehouse ID"
								value={draft.warehouseId}
							/>
							<Select
								onValueChange={(value) => {
									setDraft((current) => ({ ...current, sort: value }));
								}}
								value={draft.sort}
							>
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
							<div className="flex gap-2">
								<Button type="submit">
									<SearchIcon data-icon="inline-start" />
									Apply
								</Button>
								<Button onClick={resetFilters} type="button" variant="outline">
									Reset
								</Button>
							</div>
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
																<DeleteConfirmDialog
																	description={
																		<>
																			This permanently removes location{" "}
																			<span className="font-medium text-foreground">
																				{location.code}
																			</span>
																			. Stock or references tied to this
																			location may block deletion.
																		</>
																	}
																	isPending={
																		deleteMutation.isPending &&
																		deletingId === location.id
																	}
																	onConfirm={async () => {
																		setDeletingId(location.id);
																		try {
																			await deleteMutation.mutateAsync(
																				location.id,
																			);
																		} finally {
																			setDeletingId(null);
																		}
																	}}
																	title="Delete location?"
																	trigger={
																		<Button
																			disabled={
																				deleteMutation.isPending &&
																				deletingId === location.id
																			}
																			size="sm"
																			type="button"
																			variant="outline"
																		>
																			<Trash2Icon data-icon="inline-start" />
																			Delete
																		</Button>
																	}
																/>
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
