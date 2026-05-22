"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ALL_VALUE = "__all__";

export type OptionalEntitySelectItem = {
	value: string;
	label: string;
};

type OptionalEntitySelectProps = {
	value: string;
	onValueChange: (value: string) => void;
	allLabel: string;
	placeholder?: string;
	items: OptionalEntitySelectItem[];
	className?: string;
	disabled?: boolean;
	loading?: boolean;
	onOpenChange?: (open: boolean) => void;
};

/**
 * Select for optional entity filters. Empty string means "no filter" (all).
 */
export function OptionalEntitySelect({
	value,
	onValueChange,
	allLabel,
	placeholder,
	items,
	className,
	disabled,
	loading = false,
	onOpenChange,
}: OptionalEntitySelectProps) {
	return (
		<Select
			disabled={disabled}
			onOpenChange={onOpenChange}
			onValueChange={(next) => {
				onValueChange(next === ALL_VALUE ? "" : next);
			}}
			value={value || ALL_VALUE}
		>
			<SelectTrigger className={cn("w-full", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>
				{loading ? (
					<SelectItem disabled value="__loading__">
						Loading…
					</SelectItem>
				) : (
					items.map((item) => (
						<SelectItem key={item.value} value={item.value}>
							{item.label}
						</SelectItem>
					))
				)}
			</SelectContent>
		</Select>
	);
}
