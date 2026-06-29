import { cn } from "@/lib/utils";

type PageHeaderProps = {
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
};

export function PageHeader({
	title,
	description,
	action,
	className,
}: PageHeaderProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-end justify-between gap-3",
				className,
			)}
		>
			<div className="flex min-w-0 flex-col gap-2">
				<h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
				{description ? (
					<p className="text-muted-foreground text-sm">{description}</p>
				) : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}
