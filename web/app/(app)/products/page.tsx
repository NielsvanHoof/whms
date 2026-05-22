"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DeleteConfirmDialog } from "@/components/confirm/delete-confirm-dialog";
import { FilterControl } from "@/components/filters/filter-control";
import { ListFilterBar } from "@/components/filters/list-filter-bar";
import { ListPagination } from "@/components/filters/list-pagination";
import { SortFilterSelect } from "@/components/filters/sort-filter-select";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { deleteProduct } from "@/lib/api/products";
import { filtersAreDirty, withPaginationParams } from "@/lib/nuqs/filter-utils";
import { useProductFilters } from "@/lib/nuqs/product-filters";
import { useListPage } from "@/lib/nuqs/use-list-page";
import { canManageProducts, canViewProducts } from "@/lib/permissions";
import {
	productQueryKeys,
	productsListQueryOptions,
} from "@/lib/queries/products";
import { toastApiError, toastSuccess } from "@/lib/toast";

const sortOptions = [
	{ value: "__default__", label: "Newest first" },
	{ value: "name", label: "Name A-Z" },
	{ value: "-name", label: "Name Z-A" },
	{ value: "sku", label: "SKU A-Z" },
	{ value: "-sku", label: "SKU Z-A" },
] as const;

export default function ProductsPage() {
	const queryClient = useQueryClient();
	const permissions = usePermissions();
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const { goToPage, page, perPage, resetPage, setPerPage } = useListPage();
	const {
		applied,
		apiQuery: filterQuery,
		applyFilters: applyFiltersBase,
		draft,
		resetFilters: resetFiltersBase,
		setDraft,
	} = useProductFilters();
	const isDirty = filtersAreDirty(applied, draft);
	const apiQuery = useMemo(
		() => withPaginationParams(filterQuery, { page, perPage }),
		[filterQuery, page, perPage],
	);

	const applyFilters = () => {
		applyFiltersBase();
		resetPage();
	};

	const resetFilters = () => {
		resetFiltersBase();
		resetPage();
	};
	const permList = permissions.permissions;
	const canView = canViewProducts(permList);
	const canCreate = canManageProducts(permList);
	const canEdit = canManageProducts(permList);
	const canDelete = canManageProducts(permList);

	const listQuery = useQuery({
		...productsListQueryOptions(apiQuery),
		placeholderData: (previousData) => previousData,
	});
	const deleteMutation = useMutation({
		mutationFn: deleteProduct,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
			toastSuccess("Product deleted");
		},
		onError: (error) => {
			void toastApiError(error, "Could not delete product.");
		},
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex items-end justify-between gap-3">
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-2xl tracking-tight">Products</h1>
					<p className="text-muted-foreground text-sm">
						Manage product master data.
					</p>
				</div>
				{canCreate ? (
					<Button asChild variant="outline">
						<Link href="/products/create">
							<PlusIcon data-icon="inline-start" />
							Create product
						</Link>
					</Button>
				) : null}
			</div>
			{!canView ? (
				<ErrorState
					description="You do not have permission to view products."
					title="Access denied"
				/>
			) : null}

			{canView ? (
				<Card>
					<ListFilterBar
						isDirty={isDirty}
						onApply={applyFilters}
						onReset={resetFilters}
					>
						<FilterControl label="Name">
							<Input
								className="w-full"
								onChange={(event) => {
									setDraft((current) => ({
										...current,
										name: event.target.value,
									}));
								}}
								placeholder="Search by name"
								value={draft.name}
							/>
						</FilterControl>
						<FilterControl label="SKU">
							<Input
								className="w-full"
								onChange={(event) => {
									setDraft((current) => ({
										...current,
										sku: event.target.value,
									}));
								}}
								placeholder="Search by SKU"
								value={draft.sku}
							/>
						</FilterControl>
						<FilterControl label="Unit">
							<Input
								className="w-full"
								onChange={(event) => {
									setDraft((current) => ({
										...current,
										unit: event.target.value,
									}));
								}}
								placeholder="Search by unit"
								value={draft.unit}
							/>
						</FilterControl>
						<FilterControl label="Status">
							<Select
								onValueChange={(value) => {
									setDraft((current) => ({ ...current, isActive: value }));
								}}
								value={draft.isActive}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Any status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All statuses</SelectItem>
									<SelectItem value="1">Active</SelectItem>
									<SelectItem value="0">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</FilterControl>
						<SortFilterSelect
							onValueChange={(value) => {
								setDraft((current) => ({ ...current, sort: value }));
							}}
							options={sortOptions}
							value={draft.sort}
						/>
					</ListFilterBar>
					<CardContent className="pt-6">
						{listQuery.isPending && !listQuery.data ? (
							<LoadingState title="Loading products" />
						) : null}
						{listQuery.isError ? (
							<ErrorState
								error={listQuery.error}
								title="Could not load products"
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
								<ListPagination
									itemLabel="product"
									meta={listQuery.data.meta}
									onPageChange={goToPage}
									onPerPageChange={setPerPage}
									perPage={perPage}
								/>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>ID</TableHead>
											<TableHead>SKU</TableHead>
											<TableHead>Name</TableHead>
											<TableHead>Unit</TableHead>
											<TableHead>Status</TableHead>
											{canEdit || canDelete ? (
												<TableHead className="text-right">Actions</TableHead>
											) : null}
										</TableRow>
									</TableHeader>
									<TableBody>
										{listQuery.data.data.map((product) => (
											<TableRow key={product.id}>
												<TableCell>{product.id}</TableCell>
												<TableCell>{product.sku}</TableCell>
												<TableCell>{product.name}</TableCell>
												<TableCell>{product.unit}</TableCell>
												<TableCell>
													{product.is_active ? "Active" : "Inactive"}
												</TableCell>
												{canEdit || canDelete ? (
													<TableCell className="text-right">
														<div className="flex justify-end gap-2">
															{canEdit ? (
																<Button asChild size="sm" variant="outline">
																	<Link href={`/products/${product.id}/edit`}>
																		<PencilIcon data-icon="inline-start" />
																		Edit
																	</Link>
																</Button>
															) : null}
															{canDelete ? (
																<DeleteConfirmDialog
																	description={
																		<>
																			This permanently removes{" "}
																			<span className="font-medium text-foreground">
																				{product.name}
																			</span>{" "}
																			({product.sku}). This action cannot be
																			undone.
																		</>
																	}
																	isPending={
																		deleteMutation.isPending &&
																		deletingId === product.id
																	}
																	onConfirm={async () => {
																		setDeletingId(product.id);
																		try {
																			await deleteMutation.mutateAsync(
																				product.id,
																			);
																		} finally {
																			setDeletingId(null);
																		}
																	}}
																	title="Delete product?"
																	trigger={
																		<Button
																			disabled={
																				deleteMutation.isPending &&
																				deletingId === product.id
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
