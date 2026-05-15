"use client";

import { useAuth } from "@/hooks/use-auth";

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) {
		return "Good morning";
	}
	if (hour < 17) {
		return "Good afternoon";
	}
	return "Good evening";
}

function formatToday(): string {
	return new Date().toLocaleDateString(undefined, {
		weekday: "long",
		month: "long",
		day: "numeric",
	});
}

export function DashboardHeader() {
	const auth = useAuth();
	const name =
		auth.status === "authenticated" && auth.user
			? auth.user.name.split(" ")[0]
			: null;

	return (
		<header className="flex flex-col gap-1 border-b border-border/60 pb-6">
			<p className="text-muted-foreground text-sm">{formatToday()}</p>
			<h1 className="font-semibold text-2xl tracking-tight">
				{getGreeting()}
				{name ? `, ${name}` : ""}
			</h1>
			<p className="max-w-2xl text-muted-foreground text-sm">
				Tenant snapshot across warehouses, master data, and stock — open a
				section below or use quick actions on the right.
			</p>
		</header>
	);
}
