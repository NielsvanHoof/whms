"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { FilterControl } from "@/components/filters/filter-control";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	LIST_PER_PAGE_OPTIONS,
	type ListPerPage,
} from "@/lib/api/list-query-params";

export type ListPaginationMeta = {
	current_page: number;
	last_page: number;
	total: number;
};

type ListPaginationProps = {
	meta: ListPaginationMeta;
	/** Singular noun, e.g. `balance` → "42 balances". */
	itemLabel: string;
	/** Optional plural override when it is not `${itemLabel}s`. */
	itemLabelPlural?: string;
	perPage: number;
	onPageChange: (page: number) => void;
	onPerPageChange: (perPage: number) => void;
};

function formatItemCount(
	total: number,
	singular: string,
	plural: string,
): string {
	return `${total} ${total === 1 ? singular : plural}`;
}

/**
 * Summary line, page-size select, and previous/next controls for index tables.
 */
export function ListPagination({
	meta,
	itemLabel,
	itemLabelPlural,
	perPage,
	onPageChange,
	onPerPageChange,
}: ListPaginationProps) {
	const plural = itemLabelPlural ?? `${itemLabel}s`;
	const canGoPrevious = meta.current_page > 1;
	const canGoNext = meta.current_page < meta.last_page;
	const showPageControls = meta.last_page > 1;
	const perPageValue = String(
		LIST_PER_PAGE_OPTIONS.includes(perPage as ListPerPage)
			? perPage
			: LIST_PER_PAGE_OPTIONS[0],
	);

	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<p className="text-muted-foreground text-sm">
				{formatItemCount(meta.total, itemLabel, plural)}
				{showPageControls ? (
					<>
						{" "}
						(page {meta.current_page} of {meta.last_page})
					</>
				) : null}
			</p>
			<div className="flex flex-wrap items-end gap-2">
				<FilterControl className="w-auto min-w-[7.5rem]" label="Rows per page">
					<Select
						onValueChange={(value) => {
							onPerPageChange(Number(value));
						}}
						value={perPageValue}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{LIST_PER_PAGE_OPTIONS.map((option) => (
								<SelectItem key={option} value={String(option)}>
									{option}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FilterControl>
				{showPageControls ? (
					<div className="flex items-center gap-2 pb-0.5">
						<Button
							disabled={!canGoPrevious}
							onClick={() => {
								onPageChange(meta.current_page - 1);
							}}
							size="sm"
							type="button"
							variant="outline"
						>
							<ChevronLeftIcon aria-hidden data-icon="inline-start" />
							Previous
						</Button>
						<Button
							disabled={!canGoNext}
							onClick={() => {
								onPageChange(meta.current_page + 1);
							}}
							size="sm"
							type="button"
							variant="outline"
						>
							Next
							<ChevronRightIcon aria-hidden data-icon="inline-end" />
						</Button>
					</div>
				) : null}
			</div>
		</div>
	);
}
