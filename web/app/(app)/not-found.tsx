import Link from "next/link";

import { ErrorState } from "@/components/query/error-state";
import { Button } from "@/components/ui/button";

export default function AppNotFound() {
	return (
		<div className="flex min-h-full flex-1 items-center justify-center p-6">
			<div className="flex w-full max-w-2xl flex-col gap-4">
				<ErrorState
					description="The workspace page or resource you requested could not be found."
					title="Not found"
				/>
				<div>
					<Button asChild variant="outline">
						<Link href="/dashboard">Back to dashboard</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
