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
import { deleteProduct, type ProductsIndexQuery } from "@/lib/api/products";
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
const productSortValues = ["name", "-name", "sku", "-sku"] as const;
type ProductSort = (typeof productSortValues)[number];

function isProductSort(value: string): value is ProductSort {
	return productSortValues.includes(value as ProductSort);
}

export default function ProductsPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const searchParams = useSearchParams();
	const permissions = usePermissions();
	const [deletingId, setDeletingId] = useState<number | null>(null);

	const nameFilter = searchParams.get("filter[name]") ?? "";
	const skuFilter = searchParams.get("filter[sku]") ?? "";
	const unitFilter = searchParams.get("filter[unit]") ?? "";
	const isActiveFilter = searchParams.get("filter[is_active]") ?? "";
	const sort = searchParams.get("sort") ?? "";
	const [nameFilterValue, setNameFilterValue] = useState(nameFilter);
	const [skuFilterValue, setSkuFilterValue] = useState(skuFilter);
	const [unitFilterValue, setUnitFilterValue] = useState(unitFilter);
	const [activeFilterValue, setActiveFilterValue] = useState(
		isActiveFilter || "all",
	);
	const [sortValue, setSortValue] = useState(sort || "__default__");
	const permList = permissions.permissions;
	const canView = canViewProducts(permList);
	const canCreate = canManageProducts(permList);
	const canEdit = canManageProducts(permList);
	const canDelete = canManageProducts(permList);

	useEffect(() => {
		setNameFilterValue(nameFilter);
		setSkuFilterValue(skuFilter);
		setUnitFilterValue(unitFilter);
		setActiveFilterValue(isActiveFilter || "all");
		setSortValue(sort || "__default__");
	}, [isActiveFilter, nameFilter, skuFilter, sort, unitFilter]);

	const query = useMemo<ProductsIndexQuery>(() => {
		const validSort = isProductSort(sort) ? sort : "";
		return {
			...(nameFilter ? { "filter[name]": nameFilter } : {}),
			...(skuFilter ? { "filter[sku]": skuFilter } : {}),
			...(unitFilter ? { "filter[unit]": unitFilter } : {}),
			...(isActiveFilter ? { "filter[is_active]": isActiveFilter } : {}),
			...(validSort ? { sort: [validSort] } : {}),
		};
	}, [isActiveFilter, nameFilter, skuFilter, sort, unitFilter]);

	const listQuery = useQuery({
		...productsListQueryOptions(query),
		placeholderData: (previousData) => previousData,
	});
	const deleteMutation = useMutation({
		mutationFn: deleteProduct,
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
					<CardHeader>
						<CardTitle>Filters</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							className="flex flex-col gap-3 md:flex-row md:items-end"
							onSubmit={(event) => {
								event.preventDefault();
								const next = new URLSearchParams();
								if (nameFilterValue.trim())
									next.set("filter[name]", nameFilterValue.trim());
								if (skuFilterValue.trim())
									next.set("filter[sku]", skuFilterValue.trim());
								if (unitFilterValue.trim())
									next.set("filter[unit]", unitFilterValue.trim());
								if (activeFilterValue !== "all")
									next.set("filter[is_active]", activeFilterValue);
								if (sortValue !== "__default__") next.set("sort", sortValue);
								router.push(
									`/products${next.toString() ? `?${next.toString()}` : ""}`,
								);
							}}
						>
							<Input
								onChange={(event) => setNameFilterValue(event.target.value)}
								placeholder="Name"
								value={nameFilterValue}
							/>
							<Input
								onChange={(event) => setSkuFilterValue(event.target.value)}
								placeholder="SKU"
								value={skuFilterValue}
							/>
							<Input
								onChange={(event) => setUnitFilterValue(event.target.value)}
								placeholder="Unit"
								value={unitFilterValue}
							/>
							<Select
								onValueChange={setActiveFilterValue}
								value={activeFilterValue}
							>
								<SelectTrigger className="w-full md:w-40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All statuses</SelectItem>
									<SelectItem value="1">Active</SelectItem>
									<SelectItem value="0">Inactive</SelectItem>
								</SelectContent>
							</Select>
							<Select onValueChange={setSortValue} value={sortValue}>
								<SelectTrigger className="w-full md:w-48">
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
																<Button
																	disabled={
																		deleteMutation.isPending &&
																		deletingId === product.id
																	}
																	onClick={async () => {
																		if (
																			!window.confirm(
																				`Delete product ${product.name}?`,
																			)
																		)
																			return;
																		setDeletingId(product.id);
																		await deleteMutation.mutateAsync(
																			product.id,
																		);
																		await queryClient.invalidateQueries({
																			queryKey: productQueryKeys.all,
																		});
																		setDeletingId(null);
																	}}
																	size="sm"
																	type="button"
																	variant="outline"
																>
																	{deleteMutation.isPending &&
																	deletingId === product.id ? (
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
