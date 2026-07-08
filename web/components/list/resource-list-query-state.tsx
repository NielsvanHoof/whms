import { ErrorState } from "@/components/query/error-state";
import { LoadingState } from "@/components/query/loading-state";
import { RefreshingIndicator } from "@/components/query/refreshing-indicator";

type ResourceListQueryStateProps<TData> = {
	data: TData | undefined;
	error: unknown;
	isError: boolean;
	isFetching: boolean;
	isPendingVisible: boolean;
	loadingTitle: string;
	loadingDescription?: string;
	errorTitle: string;
	errorDescription?: string;
	onRetry: () => void;
	children: (data: TData) => React.ReactNode;
};

export function ResourceListQueryState<TData>({
	data,
	error,
	isError,
	isFetching,
	isPendingVisible,
	loadingTitle,
	loadingDescription,
	errorTitle,
	errorDescription,
	onRetry,
	children,
}: ResourceListQueryStateProps<TData>) {
	return (
		<>
			{isPendingVisible && !data ? (
				<LoadingState description={loadingDescription} title={loadingTitle} />
			) : null}
			{isError ? (
				<ErrorState
					description={errorDescription}
					error={error}
					isRetrying={isFetching && !isPendingVisible}
					onRetry={onRetry}
					title={errorTitle}
				/>
			) : null}
			{!isError && data ? (
				<div className="relative flex flex-col gap-3">
					{isFetching && !isPendingVisible ? <RefreshingIndicator /> : null}
					{children(data)}
				</div>
			) : null}
		</>
	);
}
