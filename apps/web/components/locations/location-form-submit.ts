import type { QueryClient, UseMutationResult } from "@tanstack/react-query";
import type { useRouter } from "next/navigation";
import type { UseFormSetError } from "react-hook-form";
import type {
	CreateLocationRequestBody,
	CreateLocationResponse,
	UpdateLocationRequestBody,
	UpdateLocationResponse,
} from "@/lib/api/locations";
import { handleMutationFormError } from "@/lib/forms/handle-mutation-form-error";
import { locationQueryKeys } from "@/lib/queries/locations";
import type { LocationFormValues } from "@/lib/schemas/location-form";
import { toastSuccess } from "@/lib/toast";

type Router = ReturnType<typeof useRouter>;

export type LocationFormSubmitContext = {
	mode: "create" | "edit";
	router: Router;
	queryClient: QueryClient;
	createMutation: UseMutationResult<
		CreateLocationResponse,
		Error,
		CreateLocationRequestBody
	>;
	updateMutation: UseMutationResult<
		UpdateLocationResponse,
		Error,
		Omit<UpdateLocationRequestBody, "location_id">
	>;
	setFormError: (message: string | null) => void;
	setError: UseFormSetError<LocationFormValues>;
};

export async function submitLocationForm(
	values: LocationFormValues,
	ctx: LocationFormSubmitContext,
): Promise<void> {
	ctx.setFormError(null);

	const body = {
		warehouse_id: values.warehouseId,
		code: values.code,
		type: values.type,
	};

	try {
		if (ctx.mode === "create") {
			await ctx.createMutation.mutateAsync(body);
		} else {
			await ctx.updateMutation.mutateAsync(body);
		}

		await ctx.queryClient.invalidateQueries({
			queryKey: locationQueryKeys.all,
		});
		toastSuccess(
			ctx.mode === "create" ? "Location created" : "Location updated",
		);
		ctx.router.push("/locations");
		ctx.router.refresh();
	} catch (err) {
		await handleMutationFormError({
			err,
			setError: ctx.setError,
			setFormError: ctx.setFormError,
			fields: {
				warehouse_id: "warehouseId",
				code: "code",
				type: "type",
			},
			messages: {
				validationFallback: "Could not save location.",
				generic: "Could not save location. Please try again.",
			},
		});
	}
}
