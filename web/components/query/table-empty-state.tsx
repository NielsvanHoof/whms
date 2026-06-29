import type { LucideIcon } from "lucide-react";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TableEmptyStateProps = {
	colSpan: number;
	title: string;
	description?: string;
	icon?: LucideIcon;
	className?: string;
};

export function TableEmptyState({
	colSpan,
	title,
	description,
	icon: Icon,
	className,
}: TableEmptyStateProps) {
	return (
		<TableRow>
			<TableCell className="p-0" colSpan={colSpan}>
				<Empty className={cn("border-0 px-4 py-10", className)}>
					<EmptyHeader>
						{Icon ? (
							<EmptyMedia variant="icon">
								<Icon aria-hidden />
							</EmptyMedia>
						) : null}
						<EmptyTitle>{title}</EmptyTitle>
						{description ? (
							<EmptyDescription>{description}</EmptyDescription>
						) : null}
					</EmptyHeader>
				</Empty>
			</TableCell>
		</TableRow>
	);
}
