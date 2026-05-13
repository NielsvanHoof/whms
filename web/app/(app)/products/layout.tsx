import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function ProductsLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <DashboardShell>{children}</DashboardShell>;
}
