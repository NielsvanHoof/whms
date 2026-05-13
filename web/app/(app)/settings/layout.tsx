import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function SettingsLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <DashboardShell>{children}</DashboardShell>;
}
