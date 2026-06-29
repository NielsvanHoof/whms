"use client";

import { useQuery } from "@tanstack/react-query";
import { PackageSearchIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { FilterControl } from "@/components/filters/filter-control";
import { ListFilterBar } from "@/components/filters/list-filter-bar";
import { ListPagination } from "@/components/filters/list-pagination";
import { SortFilterSelect } from "@/components/filters/sort-filter-select";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { RefreshingIndicator } from "@/components/query/refreshing-indicator";
import { TableEmptyState } from "@/components/query/table-empty-state";
import { TableRowActions } from "@/components/table/table-row-actions";
import { Badge } from "@/components/ui/badge";
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
import { useDelayedPending } from "@/hooks/use-delayed-pending";
import { useDeleteRowMutation } from "@/hooks/use-delete-row-mutation";
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

const sortOptions = [
	{ value: "__default__", label: "Newest first" },
	{ value: "name", label: "Name A-Z" },
	{ value: "-name", label: "Name Z-A" },
	{ value: "sku", label: "SKU A-Z" },
	{ value: "-sku", label: "SKU Z-A" },
] as const;

export default function ProductsPage() {
	const permissions = usePermissions();
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

	const showPending = useDelayedPending(listQuery.isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	const { deleteRow, isDeleting } = useDeleteRowMutation({
		deleteFn: deleteProduct,
		invalidateQueryKey: productQueryKeys.all,
		successMessage: "Product deleted",
		errorMessage: "Could not delete product.",
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<PageHeader
				action={
					canCreate ? (
						<Button asChild size="sm" variant="outline">
							<Link href="/products/create">
								<PlusIcon data-icon="inline-start" />
								Create product
							</Link>
						</Button>
					) : null
				}
				description="Manage product master data."
				title="Products"
			/>
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
						{showPending && !listQuery.data ? (
							<LoadingState title="Loading products" />
						) : null}
						{listQuery.isError ? (
							<ErrorState
								error={listQuery.error}
								isRetrying={listQuery.isFetching && !showPending}
								onRetry={() => {
									void listQuery.refetch();
								}}
								title="Could not load products"
							/>
						) : null}
						{listQuery.data ? (
							<div className="relative flex flex-col gap-3">
								{listQuery.isFetching && !showPending ? (
									<RefreshingIndicator />
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
										{listQuery.data.data.length ? (
											listQuery.data.data.map((product) => (
												<TableRow key={product.id}>
													<TableCell>{product.id}</TableCell>
													<TableCell>{product.sku}</TableCell>
													<TableCell className="font-medium">
														<Link
															className="hover:underline"
															href={`/products/${product.id}`}
														>
															{product.name}
														</Link>
													</TableCell>
													<TableCell>{product.unit}</TableCell>
													<TableCell>
														<Badge
															variant={
																product.is_active ? "secondary" : "outline"
															}
														>
															{product.is_active ? "Active" : "Inactive"}
														</Badge>
													</TableCell>
													{canEdit || canDelete ? (
														<TableCell className="text-right">
															<TableRowActions
																canDelete={canDelete}
																canEdit={canEdit}
																deleteDescription={
																	<>
																		This permanently removes{" "}
																		<span className="font-medium text-foreground">
																			{product.name}
																		</span>{" "}
																		({product.sku}). This action cannot be
																		undone.
																	</>
																}
																deleteTitle="Delete product?"
																editHref={`/products/${product.id}/edit`}
																isDeletePending={isDeleting(product.id)}
																onDelete={() => deleteRow(product.id)}
															/>
														</TableCell>
													) : null}
												</TableRow>
											))
										) : (
											<TableEmptyState
												colSpan={canEdit || canDelete ? 6 : 5}
												description="Try adjusting the filters or create a product before recording inventory."
												icon={PackageSearchIcon}
												title="No products found"
											/>
										)}
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
