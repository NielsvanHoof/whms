import { ReorderPointEditPageClient } from "@/components/reorder-points/reorder-point-edit-page-client";

type EditReorderPointPageProps = {
	params: Promise<{ reorderPointId: string }>;
};

export default async function EditReorderPointPage({
	params,
}: EditReorderPointPageProps) {
	const { reorderPointId: reorderPointIdParam } = await params;
	const reorderPointId = Number.parseInt(reorderPointIdParam, 10);

	return (
		<ReorderPointEditPageClient
			reorderPointId={Number.isFinite(reorderPointId) ? reorderPointId : null}
		/>
	);
}
