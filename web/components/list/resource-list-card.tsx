import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ResourceListCardProps = {
	filters: React.ReactNode;
	children: React.ReactNode;
	className?: string;
};

export function ResourceListCard({
	filters,
	children,
	className,
}: ResourceListCardProps) {
	return (
		<Card className={cn("overflow-hidden", className)}>
			{filters}
			<CardContent className="pt-6">{children}</CardContent>
		</Card>
	);
}
