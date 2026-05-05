import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
	title?: string;
	description?: string;
	error?: unknown;
	onRetry?: () => void;
	isRetrying?: boolean;
};

function getErrorMessage(error: unknown): string | null {
	if (error instanceof Error) {
		return error.message;
	}
	return null;
}

/**
 * Generic query error callout.
 * Pass `onRetry={() => query.refetch()}` for React Query widgets that can retry inline.
 */
export function ErrorState({
	title = "Could not load data",
	description = "Something went wrong while fetching this section.",
	error,
	onRetry,
	isRetrying = false,
}: ErrorStateProps) {
	const message = getErrorMessage(error);

	return (
		<Alert variant="destructive">
			<AlertTitle>{title}</AlertTitle>
			<AlertDescription>
				{message ? `${description} ${message}` : description}
			</AlertDescription>
			{onRetry ? (
				<AlertAction>
					<Button
						disabled={isRetrying}
						onClick={onRetry}
						size="sm"
						type="button"
						variant="outline"
					>
						{isRetrying ? "Retrying..." : "Retry"}
					</Button>
				</AlertAction>
			) : null}
		</Alert>
	);
}
