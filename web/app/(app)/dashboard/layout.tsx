import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Dashboard · Warehouse",
	description: "Warehouse operations dashboard.",
};

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
