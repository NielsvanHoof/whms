import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function WarehousesLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <DashboardShell>{children}</DashboardShell>;
}
