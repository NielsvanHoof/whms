import type { QueryClient, UseMutationResult } from "@tanstack/react-query";
import type { useRouter } from "next/navigation";
import type { UseFormSetError } from "react-hook-form";
import type {
	CreateProductRequestBody,
	CreateProductResponse,
	UpdateProductRequestBody,
	UpdateProductResponse,
} from "@/lib/api/products";
import { handleMutationFormError } from "@/lib/forms/handle-mutation-form-error";
import { productQueryKeys } from "@/lib/queries/products";
import type { ProductFormValues } from "@/lib/schemas/product-form";
import { toastSuccess } from "@/lib/toast";

type Router = ReturnType<typeof useRouter>;

export type ProductFormSubmitContext = {
	mode: "create" | "edit";
	router: Router;
	queryClient: QueryClient;
	createMutation: UseMutationResult<
		CreateProductResponse,
		Error,
		CreateProductRequestBody
	>;
	updateMutation: UseMutationResult<
		UpdateProductResponse,
		Error,
		Omit<UpdateProductRequestBody, "product_id">
	>;
	setFormError: (message: string | null) => void;
	setError: UseFormSetError<ProductFormValues>;
};

export async function submitProductForm(
	values: ProductFormValues,
	ctx: ProductFormSubmitContext,
): Promise<void> {
	ctx.setFormError(null);

	const body = {
		sku: values.sku,
		name: values.name,
		unit: values.unit,
		is_active: values.isActive,
	};

	try {
		if (ctx.mode === "create") {
			await ctx.createMutation.mutateAsync(body);
		} else {
			await ctx.updateMutation.mutateAsync(body);
		}

		await ctx.queryClient.invalidateQueries({
			queryKey: productQueryKeys.all,
		});
		toastSuccess(ctx.mode === "create" ? "Product created" : "Product updated");
		ctx.router.push("/products");
		ctx.router.refresh();
	} catch (err) {
		await handleMutationFormError({
			err,
			setError: ctx.setError,
			setFormError: ctx.setFormError,
			fields: {
				sku: "sku",
				name: "name",
				unit: "unit",
				is_active: "isActive",
			},
			messages: {
				validationFallback: "Could not save product.",
				generic: "Could not save product. Please try again.",
			},
		});
	}
}
