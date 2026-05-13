"use client";

import { useQuery } from "@tanstack/react-query";
import { PlusIcon, SearchIcon } from "lucide-react";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDelayedPending } from "@/hooks/use-delayed-pending";
import { usePermissions } from "@/hooks/use-permissions";
import type { WarehousesIndexQuery } from "@/lib/api/warehouses";
import { canManageWarehouses, canViewWarehouses } from "@/lib/permissions";
import { warehousesListQueryOptions } from "@/lib/queries/warehouses";

const warehouseSortValues = [
	"id",
	"-id",
	"name",
	"-name",
	"code",
	"-code",
	"created_at",
	"-created_at",
] as const;
type WarehouseSort = (typeof warehouseSortValues)[number];

const sortOptions = [
	{ value: "__default__", label: "Newest first (default)" },
	{ value: "id", label: "ID ascending" },
	{ value: "-id", label: "ID descending" },
	{ value: "name", label: "Name A-Z" },
	{ value: "-name", label: "Name Z-A" },
	{ value: "code", label: "Code A-Z" },
	{ value: "-code", label: "Code Z-A" },
	{ value: "created_at", label: "Oldest first" },
	{ value: "-created_at", label: "Newest first" },
] as const;

function isWarehouseSort(value: string): value is WarehouseSort {
	return warehouseSortValues.includes(value as WarehouseSort);
}

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return date.toLocaleString();
}

export default function WarehousesPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const permissions = usePermissions();

	const query = useMemo<WarehousesIndexQuery>(() => {
		const nameFilter = searchParams.get("filter[name]") ?? "";
		const codeFilter = searchParams.get("filter[code]") ?? "";
		const sortValue = searchParams.get("sort") ?? "";
		const validSort = isWarehouseSort(sortValue) ? sortValue : "";

		return {
			...(nameFilter ? { "filter[name]": nameFilter } : {}),
			...(codeFilter ? { "filter[code]": codeFilter } : {}),
			...(validSort ? { sort: [validSort] } : {}),
		};
	}, [searchParams]);

	const {
		data: warehouses,
		error,
		isError,
		isFetching,
		isPending,
		refetch,
	} = useQuery({
		...warehousesListQueryOptions(query),
		placeholderData: (previousData) => previousData,
	});

	const showPending = useDelayedPending(isPending, {
		delayMs: 120,
		minVisibleMs: 220,
	});

	const currentNameFilter = searchParams.get("filter[name]") ?? "";
	const currentCodeFilter = searchParams.get("filter[code]") ?? "";
	const currentSort = searchParams.get("sort") ?? "";
	const [nameFilterValue, setNameFilterValue] = useState(currentNameFilter);
	const [codeFilterValue, setCodeFilterValue] = useState(currentCodeFilter);
	const [sortValue, setSortValue] = useState(currentSort || "__default__");
	const permList = permissions.permissions;
	const canView = canViewWarehouses(permList);
	const canCreate = canManageWarehouses(permList);

	useEffect(() => {
		setNameFilterValue(currentNameFilter);
		setCodeFilterValue(currentCodeFilter);
		setSortValue(currentSort || "__default__");
	}, [currentCodeFilter, currentNameFilter, currentSort]);

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl tracking-tight">Warehouses</h1>
				<p className="text-muted-foreground text-sm">
					Browse tenant warehouses and filter by name or code.
				</p>
				{canCreate ? (
					<div>
						<Button asChild size="sm" variant="outline">
							<Link href="/warehouses/create">
								<PlusIcon data-icon="inline-start" />
								Create warehouse
							</Link>
						</Button>
					</div>
				) : null}
			</div>
			{!canView ? (
				<ErrorState
					description="You do not have permission to view warehouses."
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
								const nextName = nameFilterValue.trim();
								const nextCode = codeFilterValue.trim();
								const nextSort =
									sortValue === "__default__" ? "" : sortValue.trim();
								const nextParams = new URLSearchParams();

								if (nextName) {
									nextParams.set("filter[name]", nextName);
								}
								if (nextCode) {
									nextParams.set("filter[code]", nextCode);
								}
								if (nextSort) {
									nextParams.set("sort", nextSort);
								}

								const queryString = nextParams.toString();
								router.push(
									`/warehouses${queryString ? `?${queryString}` : ""}`,
								);
							}}
						>
							<Input
								name="filter[name]"
								onChange={(event) => {
									setNameFilterValue(event.target.value);
								}}
								placeholder="Filter by warehouse name"
								value={nameFilterValue}
							/>
							<Input
								name="filter[code]"
								onChange={(event) => {
									setCodeFilterValue(event.target.value);
								}}
								placeholder="Filter by warehouse code"
								value={codeFilterValue}
							/>
							<Select onValueChange={setSortValue} value={sortValue}>
								<SelectTrigger className="w-full md:w-64">
									<SelectValue placeholder="Sort warehouses" />
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
								<Button type="submit" variant="default">
									<SearchIcon data-icon="inline-start" />
									Apply
								</Button>
								<Button
									onClick={() => {
										router.push("/warehouses");
									}}
									type="button"
									variant="outline"
								>
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
						{showPending && !warehouses ? (
							<LoadingState
								description="Loading warehouses for the current query."
								title="Fetching warehouses"
							/>
						) : null}

						{isError ? (
							<ErrorState
								description="The warehouses list could not be fetched."
								error={error}
								isRetrying={isFetching && !showPending}
								onRetry={() => {
									void refetch();
								}}
								title="Could not load warehouses"
							/>
						) : null}

						{!isError && warehouses ? (
							<div className="relative flex flex-col gap-3">
								{isFetching && !showPending ? (
									<div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center">
										<div className="rounded-md border border-border bg-background/95 px-3 py-1 text-muted-foreground text-xs shadow-xs">
											Refreshing table...
										</div>
									</div>
								) : null}
								<div className="text-muted-foreground text-sm">
									{warehouses?.meta.total ?? 0} warehouse
									{(warehouses?.meta.total ?? 0) === 1 ? "" : "s"} found
								</div>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>ID</TableHead>
											<TableHead>Name</TableHead>
											<TableHead>Code</TableHead>
											<TableHead>Created</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{warehouses?.data.length ? (
											warehouses.data.map((warehouse) => (
												<TableRow key={warehouse.id}>
													<TableCell>{warehouse.id}</TableCell>
													<TableCell className="font-medium">
														{warehouse.name}
													</TableCell>
													<TableCell>{warehouse.code ?? "-"}</TableCell>
													<TableCell>
														{formatDate(warehouse.created_at)}
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													className="text-muted-foreground"
													colSpan={4}
												>
													No warehouses matched the current filters.
												</TableCell>
											</TableRow>
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
