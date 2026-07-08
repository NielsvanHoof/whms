import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/query/error-state";

type ResourcePageProps = {
	title: string;
	description: string;
	action?: React.ReactNode;
	canView: boolean;
	accessDeniedDescription: string;
	children: React.ReactNode;
};

export function ResourcePage({
	title,
	description,
	action,
	canView,
	accessDeniedDescription,
	children,
}: ResourcePageProps) {
	return (
		<div className="flex flex-col gap-6 p-6">
			<PageHeader action={action} description={description} title={title} />
			{canView ? (
				children
			) : (
				<ErrorState
					description={accessDeniedDescription}
					title="Access denied"
				/>
			)}
		</div>
	);
}
