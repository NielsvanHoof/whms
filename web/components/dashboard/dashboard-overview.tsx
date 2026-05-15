"use client";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { DashboardRecentMovements } from "@/components/dashboard/dashboard-recent-movements";
import { DashboardStatsGrid } from "@/components/dashboard/dashboard-stats-grid";
import { DashboardStockSnapshot } from "@/components/dashboard/dashboard-stock-snapshot";
import { DashboardWarehousesPanel } from "@/components/dashboard/dashboard-warehouses-panel";
import { usePermissions } from "@/hooks/use-permissions";
import { canViewInventory } from "@/lib/permissions";

export function DashboardOverview() {
	const { permissions } = usePermissions();
	const showInventoryPanels = canViewInventory(permissions);

	return (
		<div className="flex flex-col gap-8 p-6">
			<DashboardHeader />

			<section aria-label="Key metrics" className="flex flex-col gap-3">
				<h2 className="sr-only">Key metrics</h2>
				<DashboardStatsGrid permissions={permissions} />
			</section>

			<DashboardCharts permissions={permissions} />

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="flex flex-col gap-6 lg:col-span-2">
					{showInventoryPanels ? (
						<>
							<DashboardRecentMovements permissions={permissions} />
							<DashboardStockSnapshot permissions={permissions} />
						</>
					) : (
						<DashboardWarehousesPanel permissions={permissions} />
					)}
				</div>
				<aside className="flex flex-col gap-6">
					<DashboardQuickActions permissions={permissions} />
				</aside>
			</div>
		</div>
	);
}
