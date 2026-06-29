import { Badge } from "@/components/ui/badge";

type RefreshingIndicatorProps = {
	label?: string;
};

export function RefreshingIndicator({
	label = "Refreshing table...",
}: RefreshingIndicatorProps) {
	return (
		<div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
			<Badge className="shadow-xs" variant="secondary">
				{label}
			</Badge>
		</div>
	);
}
