"use client";

import { useQuery } from "@tanstack/react-query";
import { PackageSearchIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { FilterControl } from "@/components/filters/filter-control";
import { ListFilterBar } from "@/components/filters/list-filter-bar";
import { ListPagination } from "@/components/filters/list-pagination";
import { SortFilterSelect } from "@/components/filters/sort-filter-select";
import { ResourceListCard } from "@/components/list/resource-list-card";
import { ResourceListQueryState } from "@/components/list/resource-list-query-state";
import { ResourcePage } from "@/components/list/resource-page";
import { TableEmptyState } from "@/components/query/table-empty-state";
import { TableRowActions } from "@/components/table/table-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { filtersAreDirty, withPaginationParams } from "@/lib/nuqs/filter-utils";
import { useProductFilters } from "@/lib/nuqs/product-filters";
import { useListPage } from "@/lib/nuqs/use-list-page";
import { productListResource } from "@/lib/resources/products";

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
	const canView = productListResource.canView(permList);
	const canCreate = productListResource.canManage(permList);
	const canEdit = productListResource.canManage(permList);
	const canDelete = productListResource.canManage(permList);

	const listQuery = useQuery({
		...productListResource.listQueryOptions(apiQuery),
		placeholderData: (previousData) => previousData,
	});

	const showPending = useDelayedPending(listQuery.isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	const { deleteRow, isDeleting } = useDeleteRowMutation({
		deleteFn: productListResource.deleteFn,
		invalidateQueryKey: productListResource.invalidateQueryKey,
		successMessage: productListResource.deleteSuccessMessage,
		errorMessage: productListResource.deleteErrorMessage,
	});

	return (
		<ResourcePage
			accessDeniedDescription={productListResource.accessDeniedDescription}
			action={
				canCreate ? (
					<Button asChild size="sm" variant="outline">
						<Link href={productListResource.createHref}>
							<PlusIcon data-icon="inline-start" />
							{productListResource.createLabel}
						</Link>
					</Button>
				) : null
			}
			canView={canView}
			description={productListResource.description}
			title={productListResource.title}
		>
			<ResourceListCard
				filters={
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
				}
			>
				<ResourceListQueryState
					data={listQuery.data}
					error={listQuery.error}
					errorDescription={productListResource.errorDescription}
					errorTitle={productListResource.errorTitle}
					isError={listQuery.isError}
					isFetching={listQuery.isFetching}
					isPendingVisible={showPending}
					loadingDescription={productListResource.loadingDescription}
					loadingTitle={productListResource.loadingTitle}
					onRetry={() => {
						void listQuery.refetch();
					}}
				>
					{(products) => (
						<>
							<ListPagination
								itemLabel={productListResource.itemLabel}
								meta={products.meta}
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
									{products.data.length ? (
										products.data.map((product) => (
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
																	({product.sku}). This action cannot be undone.
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
						</>
					)}
				</ResourceListQueryState>
			</ResourceListCard>
		</ResourcePage>
	);
}
