import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function LocationsLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <DashboardShell>{children}</DashboardShell>;
}
