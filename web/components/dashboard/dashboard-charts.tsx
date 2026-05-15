"use client";

import { useQueries } from "@tanstack/react-query";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";

import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	movementActivityByDay,
	movementKindDataFromMovements,
	setupCountData,
	stockBarDataFromBalances,
} from "@/lib/dashboard/chart-data";
import {
	canViewInventory,
	canViewLocations,
	canViewProducts,
	canViewWarehouses,
} from "@/lib/permissions";
import {
	inventoryBalancesListQueryOptions,
	inventoryMovementsListQueryOptions,
} from "@/lib/queries/inventory";
import { locationsListQueryOptions } from "@/lib/queries/locations";
import { productsListQueryOptions } from "@/lib/queries/products";
import { warehousesListQueryOptions } from "@/lib/queries/warehouses";

const stockChartConfig = {
	quantity: {
		label: "On hand",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

const activityChartConfig = {
	movements: {
		label: "Movements",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

const setupChartConfig = {
	count: {
		label: "Count",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

const movementKindChartConfig = {
	receipt: { label: "Receipt", color: "var(--chart-1)" },
	adjustment: { label: "Adjustment", color: "var(--chart-2)" },
	transfer: { label: "Transfer", color: "var(--chart-3)" },
} satisfies ChartConfig;

type DashboardChartsProps = {
	permissions: readonly string[];
};

function ChartCard({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<Card className="border-border/80">
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

function InventoryCharts() {
	const [balancesQuery, movementsQuery] = useQueries({
		queries: [
			{
				...inventoryBalancesListQueryOptions({ sort: ["-quantity"] }),
			},
			{
				...inventoryMovementsListQueryOptions({ sort: ["-created_at"] }),
			},
		],
	});

	const isPending = balancesQuery.isPending || movementsQuery.isPending;
	const isError = balancesQuery.isError || movementsQuery.isError;

	if (isPending) {
		return (
			<div className="grid gap-4 lg:grid-cols-2">
				<ChartCard
					description="Loading stock and movement data."
					title="Charts"
				>
					<LoadingState title="Loading chart data" />
				</ChartCard>
			</div>
		);
	}

	if (isError) {
		return (
			<ErrorState
				description="Charts need balances and movements from the API."
				error={balancesQuery.error ?? movementsQuery.error}
				onRetry={() => {
					void balancesQuery.refetch();
					void movementsQuery.refetch();
				}}
				title="Could not load chart data"
			/>
		);
	}

	const stockData = stockBarDataFromBalances(balancesQuery.data?.data ?? []);
	const kindData = movementKindDataFromMovements(
		movementsQuery.data?.data ?? [],
	);
	const activityData = movementActivityByDay(movementsQuery.data?.data ?? []);

	return (
		<section aria-label="Inventory charts" className="flex flex-col gap-4">
			<div className="grid gap-4 lg:grid-cols-2">
				<ChartCard
					description="Highest on-hand quantities (current page of balances)."
					title="Top stock levels"
				>
					{stockData.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							No balances yet — record a receipt to see stock here.
						</p>
					) : (
						<ChartContainer
							className="aspect-auto h-[260px] w-full"
							config={stockChartConfig}
						>
							<BarChart
								accessibilityLayer
								data={stockData}
								layout="vertical"
								margin={{ left: 4, right: 12 }}
							>
								<CartesianGrid horizontal={false} />
								<YAxis
									axisLine={false}
									dataKey="sku"
									tickLine={false}
									type="category"
									width={72}
								/>
								<XAxis axisLine={false} tickLine={false} type="number" />
								<ChartTooltip
									content={<ChartTooltipContent hideLabel nameKey="sku" />}
								/>
								<Bar
									dataKey="quantity"
									fill="var(--color-quantity)"
									radius={4}
								/>
							</BarChart>
						</ChartContainer>
					)}
				</ChartCard>

				<ChartCard
					description="Share of movement kinds in the latest ledger page."
					title="Movements by type"
				>
					{kindData.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							No movements recorded yet.
						</p>
					) : (
						<ChartContainer
							className="mx-auto aspect-square h-[260px] w-full max-w-[280px]"
							config={movementKindChartConfig}
						>
							<PieChart>
								<ChartTooltip
									content={<ChartTooltipContent hideLabel nameKey="kind" />}
								/>
								<Pie
									cx="50%"
									cy="50%"
									data={kindData}
									dataKey="count"
									innerRadius={56}
									nameKey="kind"
									outerRadius={96}
									paddingAngle={2}
								>
									{kindData.map((entry) => (
										<Cell fill={entry.fill} key={entry.kind} />
									))}
								</Pie>
								<ChartLegend content={<ChartLegendContent nameKey="kind" />} />
							</PieChart>
						</ChartContainer>
					)}
				</ChartCard>
			</div>

			<ChartCard
				description="Movement count per day from the latest ledger page."
				title="Recent activity"
			>
				{activityData.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						Activity will appear once movements are posted.
					</p>
				) : (
					<ChartContainer
						className="aspect-auto h-[220px] w-full"
						config={activityChartConfig}
					>
						<AreaChart accessibilityLayer data={activityData}>
							<CartesianGrid vertical={false} />
							<XAxis
								axisLine={false}
								dataKey="date"
								tickLine={false}
								tickMargin={8}
							/>
							<ChartTooltip
								content={<ChartTooltipContent indicator="line" />}
							/>
							<Area
								dataKey="movements"
								fill="var(--color-movements)"
								fillOpacity={0.35}
								stroke="var(--color-movements)"
								type="monotone"
							/>
						</AreaChart>
					</ChartContainer>
				)}
			</ChartCard>
		</section>
	);
}

function SetupCharts({ permissions }: DashboardChartsProps) {
	const showWarehouses = canViewWarehouses(permissions);
	const showLocations = canViewLocations(permissions);
	const showProducts = canViewProducts(permissions);

	const [warehouses, locations, products] = useQueries({
		queries: [
			{ ...warehousesListQueryOptions(), enabled: showWarehouses },
			{ ...locationsListQueryOptions(), enabled: showLocations },
			{ ...productsListQueryOptions(), enabled: showProducts },
		],
	});

	const isPending =
		(showWarehouses && warehouses.isPending) ||
		(showLocations && locations.isPending) ||
		(showProducts && products.isPending);

	const setupData = setupCountData({
		...(showWarehouses ? { warehouses: warehouses.data?.meta.total ?? 0 } : {}),
		...(showLocations ? { locations: locations.data?.meta.total ?? 0 } : {}),
		...(showProducts ? { products: products.data?.meta.total ?? 0 } : {}),
	});

	if (setupData.length === 0) {
		return null;
	}

	return (
		<section aria-label="Setup overview chart" className="flex flex-col gap-4">
			<ChartCard
				description="Totals across master data you can access."
				title="Tenant setup"
			>
				{isPending ? (
					<LoadingState title="Loading counts" />
				) : (
					<ChartContainer
						className="aspect-auto h-[220px] w-full"
						config={setupChartConfig}
					>
						<BarChart accessibilityLayer data={setupData}>
							<CartesianGrid vertical={false} />
							<XAxis
								axisLine={false}
								dataKey="resource"
								tickLine={false}
								tickMargin={8}
							/>
							<ChartTooltip
								content={<ChartTooltipContent hideLabel nameKey="resource" />}
							/>
							<Bar
								dataKey="count"
								fill="var(--color-count)"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ChartContainer>
				)}
			</ChartCard>
		</section>
	);
}

export function DashboardCharts({ permissions }: DashboardChartsProps) {
	if (canViewInventory(permissions)) {
		return <InventoryCharts />;
	}
	return <SetupCharts permissions={permissions} />;
}
