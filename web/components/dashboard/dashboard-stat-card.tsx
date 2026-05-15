import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
	title: string;
	description: string;
	icon: LucideIcon;
	value: number | null;
	href?: string;
	isLoading?: boolean;
	isError?: boolean;
	error?: unknown;
	onRetry?: () => void;
	className?: string;
};

/**
 * Metric tile for the overview grid. Optional `href` wraps the card in a link.
 */
export function DashboardStatCard({
	title,
	description,
	icon: Icon,
	value,
	href,
	isLoading = false,
	isError = false,
	error,
	onRetry,
	className,
}: DashboardStatCardProps) {
	const content = (
		<Card
			className={cn(
				"relative overflow-hidden border-border/80 transition-colors",
				href && "hover:border-border hover:bg-muted/20",
				className,
			)}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-primary/5"
			/>
			<CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
				<div className="flex flex-col gap-1">
					<CardTitle className="text-base">{title}</CardTitle>
					<CardDescription className="text-xs">{description}</CardDescription>
				</div>
				<div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
					<Icon aria-hidden className="size-4" />
				</div>
			</CardHeader>
			<CardContent className="min-h-[4.5rem]">
				{isLoading ? (
					<LoadingState
						className="py-2"
						title={`Loading ${title.toLowerCase()}`}
					/>
				) : null}
				{isError ? (
					<ErrorState
						description={`Could not load ${title.toLowerCase()}.`}
						error={error}
						onRetry={onRetry}
						title="Unavailable"
					/>
				) : null}
				{!isLoading && !isError ? (
					<div className="flex items-end gap-2">
						<span className="font-semibold text-3xl tracking-tight tabular-nums">
							{value ?? "—"}
						</span>
						{value !== null ? (
							<span className="pb-0.5 text-muted-foreground text-xs">
								total
							</span>
						) : null}
					</div>
				) : null}
			</CardContent>
		</Card>
	);

	if (href && !isLoading && !isError) {
		return (
			<Link
				className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				href={href}
			>
				{content}
			</Link>
		);
	}

	return content;
}
