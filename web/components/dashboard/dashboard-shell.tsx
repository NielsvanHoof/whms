"use client";

import {
	ChevronsUpDownIcon,
	LogOutIcon,
	SettingsIcon,
	ShieldIcon,
	WarehouseIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppBreadcrumbs } from "@/components/navigation/app-breadcrumbs";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { signOut } from "@/lib/auth/sign-out";
import {
	canViewInventory,
	canViewLocations,
	canViewProducts,
	canViewRoles,
	canViewWarehouses,
} from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const auth = useAuth();
	const permissions = usePermissions();

	useEffect(() => {
		if (auth.status === "guest") {
			router.replace("/login");
		}
	}, [auth.status, router]);

	if (auth.status !== "authenticated" || !auth.user) {
		return (
			<div className="flex min-h-full flex-1 items-center justify-center">
				<Spinner className="size-8 text-muted-foreground" />
			</div>
		);
	}
	const user = auth.user;
	const permList = permissions.permissions;
	const showWarehousesNav = canViewWarehouses(permList);
	const showLocationsNav = canViewLocations(permList);
	const showProductsNav = canViewProducts(permList);
	const showInventoryNav = canViewInventory(permList);
	const canOpenAdmin = canViewRoles(permList);

	return (
		<div className="flex h-dvh overflow-hidden">
			<aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-muted/30">
				<div className="flex shrink-0 flex-col gap-1 border-b border-border px-4 py-4">
					<div className="flex items-center gap-2 font-medium">
						<span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<WarehouseIcon aria-hidden className="size-4" />
						</span>
						<span className="truncate">Warehouse</span>
					</div>
				</div>
				<nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2">
					<Link
						className={cn(
							"rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
							pathname === "/dashboard" && "bg-muted font-medium",
						)}
						href="/dashboard"
					>
						Overview
					</Link>
					{showWarehousesNav ? (
						<Link
							className={cn(
								"rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
								pathname.startsWith("/warehouses") && "bg-muted font-medium",
							)}
							href="/warehouses"
						>
							Warehouses
						</Link>
					) : null}
					{showLocationsNav ? (
						<Link
							className={cn(
								"rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
								pathname.startsWith("/locations") && "bg-muted font-medium",
							)}
							href="/locations"
						>
							Locations
						</Link>
					) : null}
					{showProductsNav ? (
						<Link
							className={cn(
								"rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
								pathname.startsWith("/products") && "bg-muted font-medium",
							)}
							href="/products"
						>
							Products
						</Link>
					) : null}
					{showInventoryNav ? (
						<Link
							className={cn(
								"flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
								pathname.startsWith("/inventory") && "bg-muted font-medium",
							)}
							href="/inventory/balances"
						>
							Inventory
						</Link>
					) : null}
				</nav>
				<div className="flex shrink-0 flex-col gap-2 p-2">
					<Separator />
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="w-full justify-between"
								type="button"
								variant="ghost"
							>
								<span className="min-w-0 truncate text-left">{user.name}</span>
								<ChevronsUpDownIcon aria-hidden />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" side="top" className="w-56">
							<DropdownMenuLabel>
								<div className="flex flex-col">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-muted-foreground text-xs">
										{user.email}
									</span>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="/settings">
									<SettingsIcon aria-hidden data-icon="inline-start" />
									Settings
								</Link>
							</DropdownMenuItem>
							{canOpenAdmin ? (
								<DropdownMenuItem asChild>
									<Link href="/admin">
										<ShieldIcon aria-hidden data-icon="inline-start" />
										Administration
									</Link>
								</DropdownMenuItem>
							) : null}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => {
									void signOut(router);
								}}
							>
								<LogOutIcon aria-hidden data-icon="inline-start" />
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</aside>
			<div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
				<div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/80 px-6 py-3">
					<AppBreadcrumbs />
					<ModeToggle />
				</div>
				<main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}
