import { FilterControl } from "@/components/filters/filter-control";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export type SortFilterOption = {
	value: string;
	label: string;
};

type SortFilterSelectProps = {
	label?: string;
	value: string;
	onValueChange: (value: string) => void;
	options: readonly SortFilterOption[];
	placeholder?: string;
	className?: string;
};

export function SortFilterSelect({
	label = "Sort",
	value,
	onValueChange,
	options,
	placeholder = "Default order",
	className,
}: SortFilterSelectProps) {
	return (
		<FilterControl className={className} label={label}>
			<Select onValueChange={onValueChange} value={value}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</FilterControl>
	);
}
