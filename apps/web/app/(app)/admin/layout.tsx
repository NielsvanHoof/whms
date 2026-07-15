import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSIONS } from "@/lib/permissions";

export default function AdminLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<PermissionGuard
			accessDeniedDescription="You do not have permission to view administration."
			anyOf={[PERMISSIONS.rolesView, PERMISSIONS.rolesManage]}
		>
			{children}
		</PermissionGuard>
	);
}
