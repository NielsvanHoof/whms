"use client";

import { WarehouseIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const auth = useAuth();

	useEffect(() => {
		if (auth.status === "guest") {
			router.replace("/login");
		}
	}, [auth.status, router]);

	if (auth.status !== "authenticated") {
		return (
			<div className="flex min-h-full flex-1 items-center justify-center">
				<Spinner className="size-8 text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="flex min-h-full flex-1">
			<aside className="flex w-56 shrink-0 flex-col border-r border-border bg-muted/30">
				<div className="flex flex-col gap-1 border-b border-border px-4 py-4">
					<div className="flex items-center gap-2 font-medium">
						<span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<WarehouseIcon aria-hidden className="size-4" />
						</span>
						<span className="truncate">Warehouse</span>
					</div>
				</div>
				<nav className="flex flex-col gap-0.5 p-2">
					<Link
						className={cn(
							"rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
							pathname === "/dashboard" && "bg-muted font-medium",
						)}
						href="/dashboard"
					>
						Overview
					</Link>
					<Link
						className={cn(
							"rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
							pathname === "/warehouses" && "bg-muted font-medium",
						)}
						href="/warehouses"
					>
						Warehouses
					</Link>
				</nav>
				<div className="mt-auto flex flex-col gap-2 p-2">
					<Separator />
					<Button
						className="w-full justify-start"
						onClick={() => {
							auth.logout();
							router.replace("/login");
							router.refresh();
						}}
						type="button"
						variant="ghost"
					>
						Sign out
					</Button>
				</div>
			</aside>
			<div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
				{children}
			</div>
		</div>
	);
}
