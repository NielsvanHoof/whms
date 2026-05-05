import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
	title?: string;
	description?: string;
	className?: string;
};

/**
 * Small generic loading block for query-driven widgets.
 * Keeps loading copy consistent without forcing every widget into a skeleton layout.
 */
export function LoadingState({
	title = "Loading",
	description = "Fetching the latest data...",
	className,
}: LoadingStateProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-lg bg-muted/40 p-4 text-sm",
				className,
			)}
		>
			<Spinner aria-hidden data-icon="inline-start" />
			<div className="flex flex-col gap-0.5">
				<span className="font-medium">{title}</span>
				<span className="text-muted-foreground">{description}</span>
			</div>
		</div>
	);
}
