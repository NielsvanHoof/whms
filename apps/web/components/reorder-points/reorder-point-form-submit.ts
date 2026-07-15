import type { QueryClient, UseMutationResult } from "@tanstack/react-query";
import type { useRouter } from "next/navigation";
import type { UseFormSetError } from "react-hook-form";
import type {
	CreateReorderPointRequestBody,
	CreateReorderPointResponse,
	UpdateReorderPointRequestBody,
	UpdateReorderPointResponse,
} from "@/lib/api/reorder-points";
import { handleMutationFormError } from "@/lib/forms/handle-mutation-form-error";
import { reorderPointQueryKeys } from "@/lib/queries/reorder-points";
import type { ReorderPointFormValues } from "@/lib/schemas/reorder-point-form";
import { toastSuccess } from "@/lib/toast";

type Router = ReturnType<typeof useRouter>;

export type ReorderPointFormSubmitContext = {
	mode: "create" | "edit";
	router: Router;
	queryClient: QueryClient;
	createMutation: UseMutationResult<
		CreateReorderPointResponse,
		Error,
		CreateReorderPointRequestBody
	>;
	updateMutation: UseMutationResult<
		UpdateReorderPointResponse,
		Error,
		Omit<UpdateReorderPointRequestBody, "reorder_point_id">
	>;
	setFormError: (message: string | null) => void;
	setError: UseFormSetError<ReorderPointFormValues>;
};

export async function submitReorderPointForm(
	values: ReorderPointFormValues,
	ctx: ReorderPointFormSubmitContext,
): Promise<void> {
	ctx.setFormError(null);

	try {
		if (ctx.mode === "create") {
			await ctx.createMutation.mutateAsync({
				product_id: values.productId,
				location_id: values.locationId,
				quantity: values.quantity,
			});
		} else {
			await ctx.updateMutation.mutateAsync({ quantity: values.quantity });
		}

		await ctx.queryClient.invalidateQueries({
			queryKey: reorderPointQueryKeys.all,
		});
		toastSuccess(
			ctx.mode === "create" ? "Reorder point created" : "Reorder point updated",
		);
		ctx.router.push("/inventory/reorder-points");
		ctx.router.refresh();
	} catch (err) {
		await handleMutationFormError({
			err,
			setError: ctx.setError,
			setFormError: ctx.setFormError,
			fields: {
				product_id: "productId",
				location_id: "locationId",
				quantity: "quantity",
			},
			messages: {
				validationFallback: "Could not save reorder point.",
				generic: "Could not save reorder point. Please try again.",
			},
		});
	}
}
