import { WarehouseEditPageClient } from "@/components/warehouses/warehouse-edit-page-client";

type EditWarehousePageProps = {
	params: Promise<{ warehouseId: string }>;
};

export default async function EditWarehousePage({
	params,
}: EditWarehousePageProps) {
	const { warehouseId: warehouseIdParam } = await params;
	const warehouseId = Number.parseInt(warehouseIdParam, 10);

	return (
		<WarehouseEditPageClient
			warehouseId={Number.isFinite(warehouseId) ? warehouseId : null}
		/>
	);
}
