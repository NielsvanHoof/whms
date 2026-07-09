import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSIONS } from "@/lib/permissions";

export default function InventoryLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<PermissionGuard
			accessDeniedDescription="You do not have permission to view inventory."
			anyOf={[PERMISSIONS.inventoryView, PERMISSIONS.inventoryManage]}
		>
			{children}
		</PermissionGuard>
	);
}
