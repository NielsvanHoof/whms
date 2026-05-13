import { PermissionGuard } from "@/components/auth/permission-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PERMISSIONS } from "@/lib/permissions";

export default function AdminLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<DashboardShell>
			<PermissionGuard anyOf={[PERMISSIONS.rolesView, PERMISSIONS.rolesManage]}>
				{children}
			</PermissionGuard>
		</DashboardShell>
	);
}
