import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
	title: "Dashboard · Warehouse",
	description: "Warehouse operations dashboard.",
};

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <DashboardShell>{children}</DashboardShell>;
}
