"use client";

import type { LucideIcon } from "lucide-react";
import {
	ArrowLeftRightIcon,
	ChevronRightIcon,
	MapPinIcon,
	PackageIcon,
	ShieldIcon,
	ShoppingBagIcon,
	WarehouseIcon,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	canManageInventory,
	canManageLocations,
	canManageProducts,
	canManageWarehouses,
	canViewInventory,
	canViewRoles,
	canViewWarehouses,
} from "@/lib/permissions";

type QuickAction = {
	label: string;
	description: string;
	href: string;
	icon: LucideIcon;
};

type DashboardQuickActionsProps = {
	permissions: readonly string[];
};

export function DashboardQuickActions({
	permissions,
}: DashboardQuickActionsProps) {
	const actions: QuickAction[] = [];

	if (canManageInventory(permissions)) {
		actions.push({
			label: "Record movement",
			description: "Receipt, adjustment, or transfer",
			href: "/inventory/movements",
			icon: ArrowLeftRightIcon,
		});
	}
	if (canViewInventory(permissions)) {
		actions.push({
			label: "Stock balances",
			description: "On-hand by location",
			href: "/inventory/balances",
			icon: PackageIcon,
		});
	}
	if (canManageWarehouses(permissions)) {
		actions.push({
			label: "Create warehouse",
			description: "Add a new site",
			href: "/warehouses/create",
			icon: WarehouseIcon,
		});
	} else if (canViewWarehouses(permissions)) {
		actions.push({
			label: "Browse warehouses",
			description: "View all sites",
			href: "/warehouses",
			icon: WarehouseIcon,
		});
	}
	if (canManageProducts(permissions)) {
		actions.push({
			label: "Create product",
			description: "Add SKU to catalog",
			href: "/products/create",
			icon: ShoppingBagIcon,
		});
	}
	if (canManageLocations(permissions)) {
		actions.push({
			label: "Create location",
			description: "Add bin or zone",
			href: "/locations/create",
			icon: MapPinIcon,
		});
	}
	if (canViewRoles(permissions)) {
		actions.push({
			label: "Administration",
			description: "Roles and users",
			href: "/admin",
			icon: ShieldIcon,
		});
	}

	return (
		<Card className="border-border/80">
			<CardHeader>
				<CardTitle className="text-base">Quick actions</CardTitle>
				<CardDescription>
					Jump to common tasks based on your permissions.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				{actions.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						No actions available — you may have view-only access.
					</p>
				) : (
					actions.map((action) => (
						<Button
							asChild
							className="h-auto w-full justify-start gap-3 px-3 py-3"
							key={action.href + action.label}
							variant="outline"
						>
							<Link href={action.href}>
								<span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
									<action.icon aria-hidden className="size-4" />
								</span>
								<span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
									<span className="font-medium">{action.label}</span>
									<span className="font-normal text-muted-foreground text-xs">
										{action.description}
									</span>
								</span>
								<ChevronRightIcon
									aria-hidden
									className="ml-auto size-4 shrink-0 opacity-40"
								/>
							</Link>
						</Button>
					))
				)}
			</CardContent>
		</Card>
	);
}
