"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { use } from "react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { LocationForm } from "@/components/locations/location-form";
import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/lib/permissions";
import { locationDetailQueryOptions } from "@/lib/queries/locations";

export default function EditLocationPage({
	params,
}: {
	params: Promise<{ locationId: string }>;
}) {
	const { locationId: locationIdParam } = use(params);
	const locationId = Number.parseInt(locationIdParam, 10);
	const idIsValid = Number.isFinite(locationId);

	const query = useQuery({
		...locationDetailQueryOptions(idIsValid ? locationId : 0),
		enabled: idIsValid,
	});

	return (
		<PermissionGuard allOf={[PERMISSIONS.locationsManage]}>
			<div className="flex flex-col gap-6 p-6">
				<div className="flex items-center justify-between gap-3">
					<div className="flex flex-col gap-2">
						<h1 className="font-semibold text-2xl tracking-tight">
							Edit location
						</h1>
						<p className="text-muted-foreground text-sm">
							Update location details.
						</p>
					</div>
					<Button asChild variant="outline">
						<Link href="/locations">
							<ArrowLeftIcon data-icon="inline-start" />
							Back to list
						</Link>
					</Button>
				</div>
				{!idIsValid ? (
					<ErrorState
						description="The location ID in the URL is not valid."
						title="Invalid location"
					/>
				) : null}
				{idIsValid && query.isPending ? (
					<LoadingState title="Loading location" />
				) : null}
				{idIsValid && query.isError ? (
					<ErrorState error={query.error} title="Could not load location" />
				) : null}
				{query.data ? (
					<LocationForm
						defaultValues={{
							warehouseId: query.data.data.warehouse_id,
							code: query.data.data.code,
							type: query.data.data.type,
						}}
						locationId={locationId}
						mode="edit"
					/>
				) : null}
			</div>
		</PermissionGuard>
	);
}
