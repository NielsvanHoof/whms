"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/query/error-state";

export default function AppError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-full flex-1 items-center justify-center p-6">
			<div className="w-full max-w-2xl">
				<ErrorState
					description="The current workspace view failed to render."
					error={error}
					onRetry={reset}
					title="Workspace error"
				/>
			</div>
		</div>
	);
}
