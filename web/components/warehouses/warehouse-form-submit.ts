import type { QueryClient, UseMutationResult } from "@tanstack/react-query";
import type { useRouter } from "next/navigation";
import type { UseFormClearErrors, UseFormSetError } from "react-hook-form";
import type {
	CreateWarehouseRequestBody,
	CreateWarehouseResponse,
	UpdateWarehouseRequestBody,
	UpdateWarehouseResponse,
} from "@/lib/api/warehouses";
import { handleMutationFormError } from "@/lib/forms/handle-mutation-form-error";
import { warehouseQueryKeys } from "@/lib/queries/warehouses";
import type { WarehouseCreateFormValues } from "@/lib/schemas/warehouse-create";
import { toastSuccess } from "@/lib/toast";

type Router = ReturnType<typeof useRouter>;

export type WarehouseFormSubmitContext = {
	mode: "create" | "edit";
	warehouseId?: number;
	router: Router;
	queryClient: QueryClient;
	createMutation: UseMutationResult<
		CreateWarehouseResponse,
		Error,
		CreateWarehouseRequestBody
	>;
	updateMutation: UseMutationResult<
		UpdateWarehouseResponse,
		Error,
		Omit<UpdateWarehouseRequestBody, "warehouse_id">
	>;
	setFormError: (message: string | null) => void;
	clearErrors: UseFormClearErrors<WarehouseCreateFormValues>;
	setError: UseFormSetError<WarehouseCreateFormValues>;
};

function toApiBody(values: WarehouseCreateFormValues) {
	return {
		name: values.name,
		code: values.code.trim().length ? values.code.trim() : null,
	};
}

export async function submitWarehouseForm(
	values: WarehouseCreateFormValues,
	ctx: WarehouseFormSubmitContext,
): Promise<void> {
	ctx.setFormError(null);
	ctx.clearErrors(["name", "code"]);

	const body = toApiBody(values);
	const actionLabel = ctx.mode === "create" ? "create" : "save";

	try {
		if (ctx.mode === "create") {
			await ctx.createMutation.mutateAsync(body);
		} else {
			await ctx.updateMutation.mutateAsync(body);
		}

		await ctx.queryClient.invalidateQueries({
			queryKey: warehouseQueryKeys.all,
		});
		toastSuccess(
			ctx.mode === "create" ? "Warehouse created" : "Warehouse updated",
		);
		ctx.router.push("/warehouses");
		ctx.router.refresh();
	} catch (err) {
		await handleMutationFormError({
			err,
			setError: ctx.setError,
			setFormError: ctx.setFormError,
			fields: { name: "name", code: "code" },
			messages: {
				validationFallback: `Could not ${actionLabel} warehouse.`,
				http: (status) =>
					`Could not ${actionLabel} warehouse (${status}). Try again.`,
				network: "Network error. Check that the API is running and try again.",
			},
		});
	}
}
