import { LocationEditPageClient } from "@/components/locations/location-edit-page-client";

type EditLocationPageProps = {
	params: Promise<{ locationId: string }>;
};

export default async function EditLocationPage({
	params,
}: EditLocationPageProps) {
	const { locationId: locationIdParam } = await params;
	const locationId = Number.parseInt(locationIdParam, 10);

	return (
		<LocationEditPageClient
			locationId={Number.isFinite(locationId) ? locationId : null}
		/>
	);
}
