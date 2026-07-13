"use client";

import {
	ChevronsUpDownIcon,
	LogOutIcon,
	MenuIcon,
	SettingsIcon,
	ShieldIcon,
	WarehouseIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppBreadcrumbs } from "@/components/navigation/app-breadcrumbs";
import { ErrorState } from "@/components/query/error-state";
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

	if (auth.status === "session_error") {
		return (
			<div className="flex min-h-full flex-1 items-center justify-center p-6">
				<div className="w-full max-w-2xl">
					<ErrorState
						description="Your session could not be verified. Check that the API is running and try again."
						error={auth.error}
						isRetrying={false}
						onRetry={auth.refetch}
						title="Could not verify session"
					/>
				</div>
			</div>
		);
	}

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
	const navItems = [
		{
			href: "/dashboard",
			label: "Overview",
			active: pathname === "/dashboard",
			show: true,
		},
		{
			href: "/warehouses",
			label: "Warehouses",
			active: pathname.startsWith("/warehouses"),
			show: showWarehousesNav,
		},
		{
			href: "/locations",
			label: "Locations",
			active: pathname.startsWith("/locations"),
			show: showLocationsNav,
		},
		{
			href: "/products",
			label: "Products",
			active: pathname.startsWith("/products"),
			show: showProductsNav,
		},
	].filter((item) => item.show);

	const inventoryNavItems = [
		{
			href: "/inventory/balances",
			label: "Balances",
			active:
				pathname === "/inventory/balances" ||
				pathname.startsWith("/inventory/balances/"),
		},
		{
			href: "/inventory/movements",
			label: "Movements",
			active:
				pathname === "/inventory/movements" ||
				pathname.startsWith("/inventory/movements/"),
		},
		{
			href: "/inventory/low-stock",
			label: "Low stock",
			active: pathname === "/inventory/low-stock",
		},
		{
			href: "/inventory/reorder-points",
			label: "Reorder points",
			active: pathname.startsWith("/inventory/reorder-points"),
		},
	];

	// Flat list for the mobile menu dropdown.
	const mobileNavItems = [
		...navItems,
		...(showInventoryNav
			? inventoryNavItems.map((item) => ({ ...item, show: true }))
			: []),
	];

	return (
		<div className="flex h-dvh overflow-hidden">
			<aside className="hidden h-full w-56 shrink-0 flex-col border-r border-border bg-muted/30 md:flex">
				<div className="flex shrink-0 flex-col gap-1 border-b border-border px-4 py-4">
					<div className="flex items-center gap-2 font-medium">
						<span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<WarehouseIcon aria-hidden className="size-4" />
						</span>
						<span className="truncate">Warehouse</span>
					</div>
				</div>
				<nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2">
					{navItems.map((item) => (
						<Link
							key={item.href}
							className={cn(
								"rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
								item.active && "bg-muted font-medium",
							)}
							href={item.href}
						>
							{item.label}
						</Link>
					))}
					{showInventoryNav ? (
						<div className="mt-2 flex flex-col gap-0.5">
							<p className="px-3 py-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wide">
								Inventory
							</p>
							{inventoryNavItems.map((item) => (
								<Link
									key={item.href}
									className={cn(
										"rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
										item.active && "bg-muted font-medium",
									)}
									href={item.href}
								>
									{item.label}
								</Link>
							))}
						</div>
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
				<div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/80 px-4 py-3 md:px-6">
					<div className="flex min-w-0 items-center gap-3">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									className="md:hidden"
									size="sm"
									type="button"
									variant="outline"
								>
									<MenuIcon aria-hidden data-icon="inline-start" />
									Menu
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-56">
								<DropdownMenuLabel>Navigation</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{mobileNavItems.map((item) => (
									<DropdownMenuItem asChild key={item.href}>
										<Link
											className={cn(item.active && "font-medium")}
											href={item.href}
										>
											{item.label}
										</Link>
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
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
						<div className="hidden min-w-0 md:block">
							<AppBreadcrumbs />
						</div>
						<div className="flex min-w-0 items-center gap-2 md:hidden">
							<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
								<WarehouseIcon aria-hidden />
							</span>
							<span className="truncate font-medium text-sm">Warehouse</span>
						</div>
					</div>
					<ModeToggle />
				</div>
				<main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}
