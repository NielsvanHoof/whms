import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FilterControlProps = {
	label: string;
	children: React.ReactNode;
	className?: string;
};

/** Compact labeled control for list filter toolbars. */
export function FilterControl({
	label,
	children,
	className,
}: FilterControlProps) {
	return (
		<div className={cn("flex min-w-0 flex-1 flex-col gap-1.5", className)}>
			<Label className="font-medium text-muted-foreground text-xs">
				{label}
			</Label>
			{children}
		</div>
	);
}
