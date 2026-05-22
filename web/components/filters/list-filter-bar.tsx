"use client";

import { RotateCcwIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ListFilterBarProps = {
	children: React.ReactNode;
	onApply: () => void;
	onReset?: () => void;
	/** Draft differs from URL-applied filters — highlights Apply. */
	isDirty?: boolean;
	className?: string;
};

/**
 * Toolbar for index-page filters. Sits above the table inside one card.
 */
export function ListFilterBar({
	children,
	onApply,
	onReset,
	isDirty = false,
	className,
}: ListFilterBarProps) {
	return (
		<div
			className={cn(
				"border-b border-border/60 bg-muted/25 px-4 py-4",
				className,
			)}
		>
			<form
				className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
				onSubmit={(event) => {
					event.preventDefault();
					onApply();
				}}
			>
				<div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{children}
				</div>
				<div className="flex shrink-0 flex-wrap items-center gap-2 lg:pb-0.5">
					{isDirty ? (
						<span className="text-muted-foreground text-xs lg:mr-1">
							Unapplied changes
						</span>
					) : null}
					<Button
						size="sm"
						type="submit"
						variant={isDirty ? "default" : "secondary"}
					>
						<SearchIcon aria-hidden data-icon="inline-start" />
						Apply filters
					</Button>
					{onReset ? (
						<Button onClick={onReset} size="sm" type="button" variant="ghost">
							<RotateCcwIcon aria-hidden data-icon="inline-start" />
							Clear
						</Button>
					) : null}
				</div>
			</form>
		</div>
	);
}
