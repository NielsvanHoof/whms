"use client";

import Link from "next/link";
import { use } from "react";

import { MovementDetailContent } from "@/components/inventory/movement-detail-content";
import { ErrorState } from "@/components/query/error-state";
import { Button } from "@/components/ui/button";

export default function InventoryMovementDetailPage({
	params,
}: {
	params: Promise<{ movementId: string }>;
}) {
	const { movementId: movementIdParam } = use(params);
	const movementId = Number.parseInt(movementIdParam, 10);
	const idIsValid = Number.isFinite(movementId) && movementId > 0;

	if (!idIsValid) {
		return (
			<div className="flex flex-col gap-4 p-6">
				<ErrorState
					description="The movement ID in the URL is not valid."
					title="Invalid movement"
				/>
				<Button asChild variant="outline">
					<Link href="/inventory/movements">Back to movements</Link>
				</Button>
			</div>
		);
	}

	return <MovementDetailContent movementId={movementId} />;
}
