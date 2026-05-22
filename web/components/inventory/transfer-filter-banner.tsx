"use client";

import { XIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type TransferFilterBannerProps = {
	correlationId: string;
	onClear: () => void;
};

export function TransferFilterBanner({
	correlationId,
	onClear,
}: TransferFilterBannerProps) {
	return (
		<Alert>
			<AlertTitle>Transfer filter active</AlertTitle>
			<AlertDescription className="flex flex-col gap-3">
				<p className="text-sm">
					Showing ledger rows for transfer{" "}
					<span className="font-mono text-xs">{correlationId}</span>. Outbound
					and inbound legs should appear together.
				</p>
				<Button
					className="w-fit"
					onClick={onClear}
					size="sm"
					type="button"
					variant="outline"
				>
					<XIcon aria-hidden data-icon="inline-start" />
					Clear transfer filter
				</Button>
			</AlertDescription>
		</Alert>
	);
}
